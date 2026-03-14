// Vercel Serverless Function - Serve Activation Page
// Route: /api/activate

export default function handler(req, res) {
  // Get license key from query
  const licenseKey = req.query.key || req.query.license || req.query.license_key || '';
  
  // HTML page with embedded license key
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Activate QuickReact Premium</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }

        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            padding: 50px;
            max-width: 600px;
            text-align: center;
        }

        .logo {
            font-size: 80px;
            margin-bottom: 20px;
        }

        h1 {
            color: #333;
            font-size: 32px;
            margin-bottom: 15px;
        }

        .subtitle {
            color: #666;
            font-size: 18px;
            margin-bottom: 30px;
            line-height: 1.6;
        }

        .license-box {
            background: #f8f9fa;
            border: 2px dashed #667eea;
            border-radius: 12px;
            padding: 20px;
            margin: 30px 0;
            font-family: 'Courier New', monospace;
            font-size: 20px;
            font-weight: 600;
            color: #667eea;
            letter-spacing: 2px;
            word-break: break-all;
        }

        .steps {
            text-align: left;
            background: #f8f9fa;
            padding: 25px;
            border-radius: 12px;
            margin: 30px 0;
        }

        .steps h3 {
            color: #333;
            margin-bottom: 15px;
            text-align: center;
        }

        .steps ol {
            padding-left: 25px;
        }

        .steps li {
            padding: 10px 0;
            color: #555;
            font-size: 16px;
            line-height: 1.6;
        }

        .buttons {
            display: flex;
            gap: 15px;
            margin-top: 30px;
        }

        .btn {
            flex: 1;
            padding: 16px;
            font-size: 16px;
            font-weight: 600;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
        }

        .btn-secondary {
            background: white;
            color: #667eea;
            border: 2px solid #667eea;
        }

        .btn-secondary:hover {
            background: #f8f9fa;
        }

        .note {
            margin-top: 30px;
            padding: 20px;
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            border-radius: 8px;
            text-align: left;
            color: #856404;
            font-size: 14px;
        }

        .note strong {
            display: block;
            margin-bottom: 8px;
        }

        .features {
            margin-top: 30px;
            text-align: left;
            background: #f8f9fa;
            padding: 20px;
            border-radius: 12px;
        }

        .features h3 {
            color: #333;
            font-size: 16px;
            margin-bottom: 15px;
            text-align: center;
        }

        .features ul {
            list-style: none;
        }

        .features li {
            padding: 8px 0;
            color: #555;
            font-size: 14px;
        }

        .features li::before {
            content: "✓ ";
            color: #4caf50;
            font-weight: bold;
            margin-right: 8px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🎉</div>
        <h1>Thank You for Your Purchase!</h1>
        <p class="subtitle">Your license key is ready. Follow these steps to activate premium features:</p>

        <div class="license-box" id="licenseKey">
            ${licenseKey || 'No license key provided'}
        </div>

        <div class="steps">
            <h3>📋 How to Activate:</h3>
            <ol>
                <li><strong>Copy your license key</strong> using the button below</li>
                <li><strong>Open QuickReact extension</strong> (click the extension icon in Chrome)</li>
                <li><strong>Click the ⭐ Premium button</strong> at the top</li>
                <li><strong>Paste your license key</strong> in the "Already have a license key?" section</li>
                <li><strong>Click "Activate"</strong> and enjoy! 🎊</li>
            </ol>
        </div>

        <div class="buttons">
            <button class="btn btn-primary" id="copyBtn">
                📋 Copy License Key
            </button>
        </div>

        <div class="features">
            <h3>✨ Premium Features Unlocked:</h3>
            <ul>
                <li>1000+ emojis across 12 categories</li>
                <li>Unlimited GIF search with Giphy</li>
                <li>Favorites system for quick access</li>
                <li>Recent emojis history (up to 50)</li>
                <li>Use on up to 3 devices</li>
                <li>Priority support</li>
            </ul>
        </div>

        <div class="note">
            <strong>💡 Can't find the extension?</strong>
            Make sure QuickReact is installed from Chrome Web Store. Your license key has also been sent to your email.
        </div>
    </div>

    <script>
        const licenseKey = '${licenseKey}';
        const copyBtn = document.getElementById('copyBtn');

        copyBtn.addEventListener('click', async () => {
            if (!licenseKey || licenseKey === 'No license key provided') {
                alert('No license key to copy!');
                return;
            }

            try {
                await navigator.clipboard.writeText(licenseKey);
                copyBtn.textContent = '✓ Copied!';
                copyBtn.style.background = '#4caf50';
                
                setTimeout(() => {
                    copyBtn.textContent = '📋 Copy License Key';
                    copyBtn.style.background = '';
                }, 2000);
            } catch (err) {
                // Fallback
                const textarea = document.createElement('textarea');
                textarea.value = licenseKey;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                
                copyBtn.textContent = '✓ Copied!';
                copyBtn.style.background = '#4caf50';
            }
        });

        // Auto-focus on license (optional)
        if (licenseKey && licenseKey !== 'No license key provided') {
            document.getElementById('licenseKey').style.animation = 'pulse 1s';
        }
    </script>
</body>
</html>`;

  // Send HTML response
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
}
