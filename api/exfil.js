export default function handler(req, res) {
    const data = req.method === 'POST' ? req.body : req.query;
    console.log('[EXFIL]', JSON.stringify(data, null, 2));
    // También puedes enviar a Discord/Slack/Telegram
    res.status(200).json({ status: 'ok' });
}
