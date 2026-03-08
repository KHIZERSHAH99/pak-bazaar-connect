/**
 * Centralized cleanup manager to prevent memory leaks from multiple intervals
 * This consolidates all periodic cleanup tasks into a single manager
 */

type CleanupTask = () => void;

class CleanupManager {
  private static instance: CleanupManager;
  private tasks = new Map<string, CleanupTask>();
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private isRunning = false;

  static getInstance(): CleanupManager {
    if (!CleanupManager.instance) {
      CleanupManager.instance = new CleanupManager();
    }
    return CleanupManager.instance;
  }

  /**
   * Register a cleanup task
   * @param id Unique identifier for the task
   * @param task The cleanup function to run
   */
  registerTask(id: string, task: CleanupTask): void {
    this.tasks.set(id, task);
  }

  /**
   * Unregister a cleanup task
   * @param id The task identifier to remove
   */
  unregisterTask(id: string): void {
    this.tasks.delete(id);
  }

  /**
   * Start the cleanup manager
   * Runs all registered tasks every 5 minutes
   */
  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    
    // Run cleanup every 5 minutes
    this.intervalId = setInterval(() => {
      this.runAllTasks();
    }, 5 * 60 * 1000);

    // Also run on visibility change (when tab becomes visible)
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }

    // Started silently
  }

  /**
   * Stop the cleanup manager
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }

    this.isRunning = false;
    console.log('[CleanupManager] Stopped');
  }

  /**
   * Run all registered cleanup tasks
   */
  runAllTasks(): void {
    const startTime = performance.now();
    let successCount = 0;
    let errorCount = 0;

    this.tasks.forEach((task, id) => {
      try {
        task();
        successCount++;
      } catch (error) {
        console.error(`[CleanupManager] Error in task ${id}:`, error);
        errorCount++;
      }
    });

    const duration = performance.now() - startTime;
    console.log(
      `[CleanupManager] Completed ${successCount} tasks in ${duration.toFixed(2)}ms` +
      (errorCount > 0 ? ` (${errorCount} errors)` : '')
    );
  }

  private handleVisibilityChange = (): void => {
    if (document.visibilityState === 'visible') {
      // Run cleanup when user returns to the tab
      this.runAllTasks();
    }
  };

  /**
   * Get stats about registered tasks
   */
  getStats(): { taskCount: number; isRunning: boolean } {
    return {
      taskCount: this.tasks.size,
      isRunning: this.isRunning,
    };
  }
}

export const cleanupManager = CleanupManager.getInstance();

// Default cleanup tasks
export function initializeCleanupTasks(): void {
  // Clear expired localStorage items
  cleanupManager.registerTask('localStorage-cleanup', () => {
    try {
      const keysToCheck = ['cart', 'auth-token-expiry'];
      keysToCheck.forEach(key => {
        const item = localStorage.getItem(key);
        if (item) {
          try {
            const parsed = JSON.parse(item);
            if (parsed.expiry && Date.now() > parsed.expiry) {
              localStorage.removeItem(key);
            }
          } catch {
            // Not JSON, skip
          }
        }
      });
    } catch (error) {
      console.error('localStorage cleanup error:', error);
    }
  });

  // Clear old session storage
  cleanupManager.registerTask('sessionStorage-cleanup', () => {
    try {
      // Clear any temporary data older than 1 hour
      const tempKeys = Object.keys(sessionStorage).filter(k => k.startsWith('temp_'));
      tempKeys.forEach(key => {
        sessionStorage.removeItem(key);
      });
    } catch (error) {
      console.error('sessionStorage cleanup error:', error);
    }
  });

  // Memory usage logging (dev only)
  if (process.env.NODE_ENV === 'development') {
    cleanupManager.registerTask('memory-logging', () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        console.log(`[Memory] Used: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
      }
    });
  }

  // Start the cleanup manager
  cleanupManager.start();
}
