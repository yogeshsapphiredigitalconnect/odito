import { io } from 'socket.io-client';
import API_BASE_URL from "@/lib/apiConfig";

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.listeners = new Map(); // Store event listeners as Map<event, Set<callback>>
    this.serverUrl = API_BASE_URL.replace('/api', '');
  }

  /**
   * Initialize WebSocket connection
   * @param {string} token - Authentication token (optional)
   */
  connect(token = null) {
    if (this.socket && this.connected) {
      console.log('🔌 Socket already connected');
      return Promise.resolve(this.socket);
    }

    console.log('🔌 Connecting to WebSocket at:', this.serverUrl);
    
    const options = {
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
      timeout: 20000,
      forceNew: false // Don't force new connections
    };

    // Add authentication if token provided
    if (token) {
      options.auth = { token };
    }

    return new Promise((resolve, reject) => {
      try {
        this.socket = io(wsUrl, options);

        this.socket.on('connect', () => {
          this.connected = true;
          console.log('🔌 Connected to WebSocket server');
          
          // Re-register all listeners after reconnection
          this.listeners.forEach((callbacks, event) => {
            callbacks.forEach(callback => {
              this.socket.on(event, callback);
            });
          });
          
          resolve(this.socket);
        });

        this.socket.on('disconnect', (reason) => {
          this.connected = false;
          console.log('🔌 Disconnected from WebSocket server:', reason);
          
          if (reason === 'io server disconnect') {
            // Server disconnected, reconnect manually
            setTimeout(() => this.connect(token), 1000);
          }
        });

        this.socket.on('connect_error', (error) => {
          console.error('🔌 Socket connection error:', error);
          this.connected = false;
          reject(error);
        });

        // Handle connection timeout
        setTimeout(() => {
          if (!this.connected) {
            reject(new Error('Socket connection timeout'));
          }
        }, options.timeout);
      } catch (error) {
        console.error('🔌 Socket initialization error:', error);
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.listeners.clear();
      console.log('🔌 Disconnected from WebSocket server');
    }
  }

  /**
   * Join an audit room to receive progress updates
   * @param {string} jobId - Job ID to join
   */
  joinAudit(jobId) {
    if (!this.socket || !this.connected) {
      console.warn('⚠️ Cannot join audit: Socket not connected');
      return;
    }

    this.socket.emit('join-audit', jobId);
    console.log(`📊 Joined audit room for job: ${jobId}`);
  }

  /**
   * Leave an audit room
   * @param {string} jobId - Job ID to leave (optional)
   */
  leaveAudit(jobId = null) {
    if (!this.socket || !this.connected) {
      console.warn('⚠️ Cannot leave audit: Socket not connected');
      return;
    }

    if (jobId) {
      this.socket.emit('leave-audit', jobId);
      console.log(`📊 Left audit room for job: ${jobId}`);
    } else {
      // Leave current room (socket.io will handle leaving all rooms)
      this.socket.emit('leave-audit');
      console.log(`📊 Left current audit room`);
    }
  }

  /**
   * Listen for audit progress updates
   * @param {Function} callback - Progress callback function
   */
  onAuditProgress(callback) {
    this.addEventListener('audit:progress', callback);
  }

  /**
   * Listen for audit started event
   * @param {Function} callback - Started callback function
   */
  onAuditStarted(callback) {
    this.addEventListener('audit:started', callback);
  }

  /**
   * Listen for audit completed event
   * @param {Function} callback - Completed callback function
   */
  onAuditCompleted(callback) {
    this.addEventListener('audit:completed', callback);
  }

  /**
   * Listen for audit error event
   * @param {Function} callback - Error callback function
   */
  onAuditError(callback) {
    this.addEventListener('audit:error', callback);
  }

  /**
   * Listen for audit stage change event
   * @param {Function} callback - Stage change callback function
   */
  onAuditStageChanged(callback) {
    this.addEventListener('audit:stageChanged', callback);
  }

  /**
   * Remove audit stage change listener
   * @param {Function} callback - Specific callback to remove
   */
  offAuditStageChanged(callback) {
    this.removeEventListener('audit:stageChanged', callback);
  }

  /**
   * Remove audit started listener
   * @param {Function} callback - Specific callback to remove
   */
  offAuditStarted(callback) {
    this.removeEventListener('audit:started', callback);
  }

  /**
   * Remove audit progress listener
   * @param {Function} callback - Specific callback to remove
   */
  offAuditProgress(callback) {
    this.removeEventListener('audit:progress', callback);
  }

  /**
   * Remove audit completed listener
   * @param {Function} callback - Specific callback to remove
   */
  offAuditCompleted(callback) {
    this.removeEventListener('audit:completed', callback);
  }

  /**
   * Remove audit error listener
   * @param {Function} callback - Specific callback to remove
   */
  offAuditError(callback) {
    this.removeEventListener('audit:error', callback);
  }

  /**
   * Add event listener with automatic re-registration
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   */
  addEventListener(event, callback) {
    // Store listener for re-registration on reconnection
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    this.listeners.get(event).add(callback);
    
    if (this.socket && this.connected) {
      this.socket.on(event, callback);
    }
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Specific callback to remove (optional)
   */
  removeEventListener(event, callback = null) {
    if (!this.listeners.has(event)) {
      return;
    }
    
    const callbacks = this.listeners.get(event);
    
    if (callback) {
      // Remove specific callback
      callbacks.delete(callback);
      
      if (this.socket && this.connected) {
        this.socket.off(event, callback);
      }
      
      // Clean up empty sets
      if (callbacks.size === 0) {
        this.listeners.delete(event);
      }
    } else {
      // Remove all callbacks for this event
      callbacks.forEach(cb => {
        if (this.socket && this.connected) {
          this.socket.off(event, cb);
        }
      });
      this.listeners.delete(event);
    }
  }

  /**
   * Check if socket is connected
   * @returns {boolean} Connection status
   */
  isConnected() {
    return this.connected && this.socket;
  }

  /**
   * Get socket instance
   * @returns {Object} Socket instance
   */
  getSocket() {
    return this.socket;
  }
}

export default new SocketService();
