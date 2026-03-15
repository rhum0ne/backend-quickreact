// Vercel Serverless Function - Serve Activation Page
// Route: /api/activate

export default function handler(req, res) {
  // Get license key from query
  const licenseKey = req.query.key || req.query.license || req.query.license_key || '';
  
  // HTML page with embedded license key
  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Activation QuickReact Premium</title>
    <style>
        /* Mêmes variables que l'extension pour une cohérence parfaite */
        :root {
            --bg-body: #f6f8fa;
            --bg-surface: #ffffff;
            --border-color: #d0d7de;
            --text-main: #24292f;
            --text-muted: #57606a;
            --primary: #0969da;
            --primary-hover: #0353a4;
            --success-text: #1a7f37;
            --radius: 6px;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
            background-color: var(--bg-body);
            color: var(--text-main);
            line-height: 1.5;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            background-color: var(--bg-surface);
            border: 1px solid var(--border-color);
            border-radius: var(--radius);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
            max-width: 480px;
            width: 100%;
            padding: 32px;
        }

        .header {
            text-align: center;
            margin-bottom: 24px;
        }

        .header-icon {
            font-size: 32px;
            margin-bottom: 12px;
        }

        h1 {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 8px;
        }

        .subtitle {
            font-size: 14px;
            color: var(--text-muted);
        }

        .license-container {
            margin: 24px 0;
        }

        .license-label {
            font-size: 12px;
            font-weight: 600;
            color: var(--text-muted);
            margin-bottom: 8px;
            display: block;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .license-box {
            background-color: var(--bg-body);
            border: 1px solid var(--border-color);
            border-radius: var(--radius);
            padding: 16px;
            font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
            font-size: 16px;
            font-weight: 600;
            text-align: center;
            letter-spacing: 1px;
            word-break: break-all;
            color: var(--text-main);
            margin-bottom: 12px;
        }

        .btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            padding: 10px 16px;
            font-size: 14px;
            font-weight: 500;
            border-radius: var(--radius);
            cursor: pointer;
            border: 1px solid transparent;
            transition: background-color 0.15s ease-in-out;
            font-family: inherit;
        }

        .btn-primary {
            background-color: var(--primary);
            color: #ffffff;
        }

        .btn-primary:hover {
            background-color: var(--primary-hover);
        }

        .instructions {
            margin-top: 32px;
            padding-top: 24px;
            border-top: 1px solid var(--border-color);
        }

        .instructions h3 {
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 16px;
        }

        .steps {
            list-style: none;
            counter-reset: step;
        }

        .steps li {
            position: relative;
            padding-left: 32px;
            margin-bottom: 12px;
            font-size: 13px;
            color: var(--text-muted);
        }

        .steps li::before {
            counter-increment: step;
            content: counter(step);
            position: absolute;
            left: 0;
            top: -2px;
            width: 22px;
            height: 22px;
            background-color: var(--bg-body);
            border: 1px solid var(--border-color);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: 600;
            color: var(--text-main);
        }

        .steps li strong {
            color: var(--text-main);
            font-weight: 600;
        }

        .support-note {
            margin-top: 24px;
            background-color: var(--bg-body);
            border: 1px solid var(--border-color);
            padding: 12px;
            border-radius: var(--radius);
            font-size: 12px;
            color: var(--text-muted);
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-icon">🎉</div>
            <h1>Merci pour votre achat !</h1>
            <p class="subtitle">Votre licence QuickReact Premium est prête.</p>
        </div>

        <div class="license-container">
            <span class="license-label">Votre clé de licence</span>
            <div class="license-box" id="licenseKey">
                ${licenseKey || 'Aucune clé fournie'}
            </div>
            <button class="btn btn-primary" id="copyBtn">
                Copier la clé
            </button>
        </div>

        <div class="instructions">
            <h3>Comment activer votre licence :</h3>
            <ul class="steps">
                <li><strong>Copiez la clé</strong> à l'aide du bouton ci-dessus.</li>
                <li><strong>Ouvrez l'extension QuickReact</strong> depuis votre navigateur (cliquez sur l'icône de l'extension).</li>
                <li>Cliquez sur le bouton <strong>Activer une clé</strong>.</li>
                <li><strong>Collez votre clé</strong> et cliquez sur Activer !</li>
            </ul>
        </div>

        <div class="support-note">
            Vous avez également reçu cette clé par email. Assurez-vous d'avoir téléchargé l'extension depuis le Chrome Web Store.
        </div>
    </div>

    <script>
        const licenseKey = '${licenseKey}';
        const copyBtn = document.getElementById('copyBtn');

        copyBtn.addEventListener('click', async () => {
            if (!licenseKey || licenseKey === 'Aucune clé fournie') {
                alert('Aucune clé à copier !');
                return;
            }

            try {
                await navigator.clipboard.writeText(licenseKey);
                showSuccess();
            } catch (err) {
                // Fallback de sécurité (anciens navigateurs)
                const textarea = document.createElement('textarea');
                textarea.value = licenseKey;
                document.body.appendChild(textarea);
                textarea.select();
                try {
                    document.execCommand('copy');
                    showSuccess();
                } catch (e) {
                    console.error('Échec de la copie', e);
                }
                document.body.removeChild(textarea);
            }
        });

        function showSuccess() {
            copyBtn.innerText = '✓ Clé copiée !';
            copyBtn.style.backgroundColor = 'var(--success-text)';
            
            setTimeout(() => {
                copyBtn.innerText = 'Copier la clé';
                copyBtn.style.backgroundColor = '';
            }, 2500);
        }
    </script>
</body>
</html>`;

  // Send HTML response
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
}