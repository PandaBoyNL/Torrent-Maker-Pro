const express = require('express');
const fs = require('fs');
const path = require('path');
const createTorrent = require('create-torrent');

const app = express();
const PORT = 8080;

app.use(express.json({ limit: '50mb' }));

// 1. Zorg dat de browser jouw index.html laadt
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 2. API: Instellingen ophalen
app.get('/api/settings', (req, res) => {
    res.json({ webhook: process.env.DISCORD_WEBHOOK || '' });
});

// 3. API: De Unraid Server-Verkenner
app.post('/api/verkenner', (req, res) => {
    let doelMap = req.body.pad || '/data'; 
    if (!doelMap.startsWith('/data')) doelMap = '/data';

    try {
        const items = fs.readdirSync(doelMap, { withFileTypes: true });
        const bestandenLijst = items.map(item => ({
            naam: item.name,
            isMap: item.isDirectory(),
            pad: path.join(doelMap, item.name)
        }));
        bestandenLijst.sort((a, b) => b.isMap - a.isMap || a.naam.localeCompare(b.naam));
        res.json({ success: true, huidigeMap: doelMap, bestanden: bestandenLijst });
    } catch (fout) {
        res.json({ success: false, error: "Kan map niet openen." });
    }
});

// --- 🔥 NIEUWE LIVE-SYNC TAAK MANAGER 🔥 ---

let alleTaken = []; // Hier onthoudt de server alles (zelfs als je afsluit!)
let werkDraadDraait = false;

// Ontvang nieuwe taken en voeg ze toe aan de server-lijst
app.post('/api/maak-batch', (req, res) => {
    const { taken, trackers, webhookUrl, turbo } = req.body;
    
    taken.forEach(nieuweTaak => {
        // Voorkom dubbele taken in de wachtrij
        if (!alleTaken.find(t => t.id === nieuweTaak.id)) {
            alleTaken.push({ ...nieuweTaak, status: 'wachtend' });
        }
    });

    res.json({ success: true });

    // Start de motor als hij nog niet draait
    if (!werkDraadDraait) {
        werkDraadDraait = true;
        startAchtergrondWerk(trackers, webhookUrl, turbo);
    }
});

// De WebUI vraagt elke 2 seconden: "Hoe gaat het ermee?"
app.get('/api/status', (req, res) => {
    res.json({ taken: alleTaken });
});

// De "Wis Voltooide Taken" knop verwijdert alle 'klaar' en 'fout' taken
app.post('/api/wis-voltooid', (req, res) => {
    alleTaken = alleTaken.filter(t => t.status === 'wachtend' || t.status === 'bezig');
    res.json({ success: true });
});

// De achtergrond-motor die het échte werk doet
async function startAchtergrondWerk(trackers, webhookUrl, turbo) {
    const trackerList = trackers.split('\n').map(t => t.trim()).filter(t => t !== '');
    let afgerondInDezeRun = 0;

    async function verwerk() {
        while (true) {
            // Zoek de volgende wachtende taak
            const taak = alleTaken.find(t => t.status === 'wachtend');
            if (!taak) break; // Lijst is leeg!
            
            taak.status = 'bezig';
            const opslagPad = path.join('/storage', taak.naam + '.torrent');
            
            try {
                await new Promise((resolve, reject) => {
                    createTorrent(taak.pad, { announceList: trackerList.map(t => [t]), name: taak.naam }, (err, torrent) => {
                        if (err) return reject(err);
                        fs.writeFile(opslagPad, torrent, (err) => {
                            if (err) return reject(err);
                            resolve();
                        });
                    });
                });
                taak.status = 'klaar';
                afgerondInDezeRun++;
            } catch (e) {
                console.log(`Fout bij ${taak.naam}:`, e);
                taak.status = 'fout';
            }
        }
    }

    const maxTegelijk = (turbo && alleTaken.length > 50) ? 5 : 1;
    const werknemers = [];
    for (let i = 0; i < maxTegelijk; i++) {
        werknemers.push(verwerk());
    }

    await Promise.all(werknemers);
    werkDraadDraait = false; // Motor mag weer uit

    // Alles klaar? Stuur Discord bericht!
    if (webhookUrl && afgerondInDezeRun > 0) {
        try {
            await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    content: `🎉 **Torrent Maker Pro:** Succesvol ${afgerondInDezeRun} torrent(s) op de achtergrond gegenereerd!` 
                })
            });
        } catch (e) {}
    }
}

app.listen(PORT, () => {
    console.log(`🚀 Torrent-Maker-Pro WebUI draait succesvol op http://localhost:${PORT}`);
});