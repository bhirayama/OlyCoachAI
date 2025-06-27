class RedirectCircuitBreaker {
  private static instance: RedirectCircuitBreaker;
  private redirectCount = 0;
  private lastRedirectTime = 0;
  private redirectHistory: Array<{ url: string, timestamp: number, source: string }> = [];
  private readonly MAX_REDIRECTS = 3;
  private readonly TIME_WINDOW = 5000; // 5 seconds

  static getInstance(): RedirectCircuitBreaker {
    if (!RedirectCircuitBreaker.instance) {
      RedirectCircuitBreaker.instance = new RedirectCircuitBreaker();
    }
    return RedirectCircuitBreaker.instance;
  }

  logRedirect(to: string, source: string): boolean {
    const now = Date.now();

    // Add to history
    this.redirectHistory.push({ url: to, timestamp: now, source });

    // Keep only recent history
    this.redirectHistory = this.redirectHistory.filter(
      entry => now - entry.timestamp < this.TIME_WINDOW
    );

    // Reset counter if enough time has passed
    if (now - this.lastRedirectTime > this.TIME_WINDOW) {
      this.redirectCount = 0;
    }

    console.log('🔄 REDIRECT ATTEMPT:', {
      to,
      source,
      count: this.redirectCount + 1,
      maxAllowed: this.MAX_REDIRECTS,
      recentHistory: this.redirectHistory,
      currentURL: window.location.href
    });

    // Check for loop pattern
    const recentRedirects = this.redirectHistory.slice(-4);
    if (recentRedirects.length >= 4) {
      const urls = recentRedirects.map(r => r.url);
      const sources = recentRedirects.map(r => r.source);

      if (urls[0] === urls[2] && urls[1] === urls[3]) {
        console.error('🚨 REDIRECT LOOP DETECTED!', {
          pattern: urls,
          sources: sources,
          blocking: true
        });

        // Show user-friendly error
        this.showLoopError();
        return false;
      }
    }

    // Check if we've hit the limit
    if (this.redirectCount >= this.MAX_REDIRECTS) {
      console.error('🚨 TOO MANY REDIRECTS!', {
        count: this.redirectCount,
        history: this.redirectHistory,
        blocking: true
      });

      this.showLoopError();
      return false;
    }

    this.redirectCount++;
    this.lastRedirectTime = now;

    return true;
  }

  private showLoopError() {
    // Create error overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.9);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-family: system-ui;
    `;

    overlay.innerHTML = `
      <div style="max-width: 500px; padding: 2rem; text-align: center;">
        <h1 style="color: #ff6b35; margin-bottom: 1rem;">Redirect Loop Detected</h1>
        <p style="margin-bottom: 2rem;">The app is stuck in an infinite redirect loop. This is a development issue.</p>
        <div style="margin-bottom: 2rem;">
          <strong>Recent redirects:</strong><br>
          ${this.redirectHistory.map(r => `${r.source} → ${r.url}`).join('<br>')}
        </div>
        <button onclick="localStorage.clear(); sessionStorage.clear(); window.location.href='/';" 
                style="background: #00d4ff; color: black; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">
          Clear Storage & Go Home
        </button>
      </div>
    `;

    document.body.appendChild(overlay);
  }

  reset() {
    this.redirectCount = 0;
    this.redirectHistory = [];
    this.lastRedirectTime = 0;
  }
}

export const circuitBreaker = RedirectCircuitBreaker.getInstance();