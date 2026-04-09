import { createApp } from '../server/app.js';

let app;
let initError;

async function handler(req, res) {
  try {
    // Initialize app once
    if (!app && !initError) {
      try {
        app = await createApp({ staticMode: 'vercel' });
      } catch (error) {
        initError = error;
        console.error('[API] App initialization failed:', error);
        return res.status(500).json({
          error: 'Server initialization failed',
          message: error.message
        });
      }
    }

    // If previous init failed, return error
    if (initError && !app) {
      console.error('[API] Using cached init error:', initError.message);
      return res.status(500).json({
        error: 'Server initialization failed',
        message: initError.message
      });
    }

    // Delegate all requests to Express app
    return app(req, res);
  } catch (error) {
    console.error('[API] Request handler error:', error);
    return res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
}

export default handler;
