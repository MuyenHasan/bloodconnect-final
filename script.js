(function(){
  // --- Theme Toggle ---
  const root = document.documentElement;
  const toggleBtn = document.getElementById('themeToggle');
  const themeLabel = document.getElementById('themeLabel');

  function applyTheme(theme){
    if(theme === 'dark'){
      root.classList.add('dark');
      toggleBtn?.setAttribute('aria-pressed','true');
      if(themeLabel) themeLabel.textContent = 'Dark Mode';
    } else {
      root.classList.remove('dark');
      toggleBtn?.setAttribute('aria-pressed','false');
      if(themeLabel) themeLabel.textContent = 'Light Mode';
    }
  }

  const saved = localStorage.getItem('bc-theme');
  if(saved){
    applyTheme(saved);
  } else {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  }

  if(toggleBtn){
    toggleBtn.addEventListener('click', function(e){
      const isDark = document.documentElement.classList.toggle('dark');
      const theme = isDark ? 'dark' : 'light';
      localStorage.setItem('bc-theme', theme);
      applyTheme(theme);
    });
  }

  // --- Highlight current navigation link ---
  document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop();
    document.querySelectorAll('.nav a.link').forEach(link => {
      if (link.getAttribute('href') === currentPage) {
        link.classList.add('active');
      }
    });
    
    // Initialize features
    initSearchFilter();
    initRequestActions();
    initStatsCounter();
    initModal();
    initTabs();
  });

 
  function showToast(message, type = 'info', duration = 3000) {
    document.querySelectorAll('.toast').forEach(t => t.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideIn 0.3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  window.bloodConnect = {
    showToast: showToast
  };

  
  function initSearchFilter() {
    const searchBtn = document.getElementById('searchBtn');
    const bloodSelect = document.getElementById('bloodTypeFilter');
    const locationInput = document.getElementById('locationFilter');
    
    if (searchBtn && bloodSelect && locationInput) {
      searchBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        searchBtn.classList.add('loading');
        searchBtn.disabled = true;
        
        setTimeout(() => {
          searchBtn.classList.remove('loading');
          searchBtn.disabled = false;
          showToast('Search functionality ready - add backend for real data', 'info');
        }, 500);
      });
      
      locationInput?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          searchBtn.click();
        }
      });
    }
  }

  
  function initRequestActions() {
    document.querySelectorAll('table').forEach(table => {
      const rows = table.querySelectorAll('tbody tr');
      rows.forEach(row => {
        const acceptBtn = row.querySelector('.btn:not(.secondary)');
        const declineBtn = row.querySelector('.btn.secondary');
        
        if (acceptBtn) {
          acceptBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showToast('Request accepted!', 'success');
            this.closest('tr').style.opacity = '0.5';
            this.disabled = true;
          });
        }
        
        if (declineBtn) {
          declineBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showToast('Request declined', 'info');
            this.closest('tr').style.opacity = '0.5';
            this.disabled = true;
          });
        }
      });
    });
  }

  function initStatsCounter() {
    const statNumbers = document.querySelectorAll('.stat .num');
    statNumbers.forEach(stat => {
      const text = stat.textContent;
      const target = parseInt(text.replace(/[^0-9]/g, ''));
      if (!isNaN(target) && target > 0) {
        animateCounter(stat, target, text);
      }
    });
  }

  function animateCounter(element, target, originalText) {
    let current = 0;
    const increment = target / 30;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        element.textContent = originalText;
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(current);
      }
    }, 50);
  }

  // ============================================
  // Modal System
  // ============================================
  function initModal() {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.id = 'modalOverlay';
    modalOverlay.innerHTML = `
      <div class="modal">
        <button class="close" onclick="closeModal()">&times;</button>
        <div class="modal-content"></div>
      </div>
    `;
    document.body.appendChild(modalOverlay);

    modalOverlay.addEventListener('click', function(e) {
      if (e.target === modalOverlay) closeModal();
    });
  }

  window.openModal = function(content) {
    const modal = document.getElementById('modalOverlay');
    if (modal) {
      modal.querySelector('.modal-content').innerHTML = content;
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeModal = function() {
    const modal = document.getElementById('modalOverlay');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  // ============================================
  // Contact Functions
  // ============================================
  window.contactDonor = function(donorId) {
    openModal(`
      <h3>Contact Donor</h3>
      <div class="form-grid">
        <div>
          <label>Your Name</label>
          <input class="input" id="contactName" placeholder="Your full name">
        </div>
        <div>
          <label>Phone Number</label>
          <input class="input" id="contactPhone" placeholder="Your phone number">
        </div>
        <div style="grid-column: 1/-1">
          <label>Message</label>
          <textarea class="input" id="contactMessage" rows="3" placeholder="I need blood donation for..."></textarea>
        </div>
      </div>
      <div class="cta-row" style="margin-top: 16px">
        <button class="btn" onclick="sendContactRequest()">Send Request</button>
        <button class="btn secondary" onclick="closeModal()">Cancel</button>
      </div>
    `);
  };

  window.sendContactRequest = function() {
    const name = document.getElementById('contactName')?.value;
    const phone = document.getElementById('contactPhone')?.value;
    
    if (!name || !phone) {
      showToast('Please fill in your name and phone number', 'error');
      return;
    }
    
    showToast('Request sent! The donor will contact you soon.', 'success');
    closeModal();
  };

  window.callDonor = function(phone) {
    window.location.href = 'tel:' + phone;
  };

  // ============================================
  // Tabs Functionality
  // ============================================
  function initTabs() {
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', function() {
        const tabName = this.dataset.tab || this.dataset.adminTab;
        if (!tabName) return;
        
        document.querySelectorAll('.tab, [data-admin-tab]').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        
        document.querySelectorAll('.tab-content, .admin-tab-content').forEach(content => {
          content.style.display = 'none';
        });
        
        const targetContent = document.getElementById('tab-' + tabName) || document.getElementById('admin-tab-' + tabName);
        if (targetContent) {
          targetContent.style.display = 'block';
        }
      });
    });
  }

  // ============================================
  // Blood Request Form Handler
  // ============================================
  const bloodRequestForm = document.getElementById('bloodRequestForm');
  if (bloodRequestForm) {
    bloodRequestForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const submitBtn = bloodRequestForm.querySelector('button[type="submit"]');
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;

      setTimeout(function() {
        showToast('Blood request submitted!', 'success');
        bloodRequestForm.reset();
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
      }, 800);
    });
  }

  // ============================================
  // Dashboard Profile Save
  // ============================================
  const saveProfileBtn = document.getElementById('saveProfileBtn');
  if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', function() {
      showToast('Profile saved successfully!', 'success');
    });
  }

  // ============================================
  // Filter Pills
  // ============================================
  document.querySelectorAll('.filter-pill').forEach(function(pill) {
    pill.addEventListener('click', function() {
      document.querySelectorAll('.filter-pill').forEach(function(p) { p.classList.remove('active'); });
      this.classList.add('active');
      showToast('Filter applied', 'info');
    });
  });

  window.filterByPill = function(btn) {
    document.querySelectorAll('.filter-pill').forEach(function(p) { p.classList.remove('active'); });
    btn.classList.add('active');
    showToast('Filtering donors...', 'info');
  };

  window.sortDonors = function(value) {
    showToast('Sorting by ' + value, 'info');
  };

  // ============================================
  // Accept/Decline Request Functions
  // ============================================
  window.acceptRequest = function(btn) {
    const row = btn.closest('tr');
    row.style.opacity = '0.5';
    btn.disabled = true;
    showToast('Request accepted!', 'success');
  };

  window.declineRequest = function(btn) {
    const row = btn.closest('tr');
    row.style.opacity = '0.5';
    btn.disabled = true;
    showToast('Request declined', 'info');
  };

})();(function(){
  // --- Theme Toggle ---
  const root = document.documentElement;
  const toggleBtn = document.getElementById('themeToggle');
  const themeLabel = document.getElementById('themeLabel');

  function applyTheme(theme){
    if(theme === 'dark'){
      root.classList.add('dark');
      toggleBtn?.setAttribute('aria-pressed','true');
      if(themeLabel) themeLabel.textContent = 'Dark Mode';
    } else {
      root.classList.remove('dark');
      toggleBtn?.setAttribute('aria-pressed','false');
      if(themeLabel) themeLabel.textContent = 'Light Mode';
    }
  }

  const saved = localStorage.getItem('bc-theme');
  if(saved){
    applyTheme(saved);
  } else {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  }

  if(toggleBtn){
    toggleBtn.addEventListener('click', function(e){
      const isDark = document.documentElement.classList.toggle('dark');
      const theme = isDark ? 'dark' : 'light';
      localStorage.setItem('bc-theme', theme);
      applyTheme(theme);
    });
  }

  // --- Highlight current navigation link ---
  document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop();
    document.querySelectorAll('.nav a.link').forEach(link => {
      if (link.getAttribute('href') === currentPage) {
        link.classList.add('active');
      }
    });
    
    // Initialize features
    initSearchFilter();
    initRequestActions();
    initStatsCounter();
    initModal();
    initTabs();
  });

  function showToast(message, type = 'info', duration = 3000) {
    document.querySelectorAll('.toast').forEach(t => t.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideIn 0.3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  window.bloodConnect = {
    showToast: showToast
  };

  function initSearchFilter() {
    const searchBtn = document.getElementById('searchBtn');
    const bloodSelect = document.getElementById('bloodTypeFilter');
    const locationInput = document.getElementById('locationFilter');
    
    if (searchBtn && bloodSelect && locationInput) {
      searchBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        searchBtn.classList.add('loading');
        searchBtn.disabled = true;
        
        setTimeout(() => {
          searchBtn.classList.remove('loading');
          searchBtn.disabled = false;
          showToast('Search functionality - connect to a backend for real results', 'info');
        }, 500);
      });
      
      locationInput?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          searchBtn.click();
        }
      });
    }
  }

  function initRequestActions() {
    document.querySelectorAll('table').forEach(table => {
      const rows = table.querySelectorAll('tbody tr');
      rows.forEach(row => {
        const acceptBtn = row.querySelector('.btn:not(.secondary)');
        const declineBtn = row.querySelector('.btn.secondary');
        
        if (acceptBtn) {
          acceptBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showToast('Request accepted!', 'success');
            this.closest('tr').style.opacity = '0.5';
            this.disabled = true;
          });
        }
        
        if (declineBtn) {
          declineBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showToast('Request declined', 'info');
            this.closest('tr').style.opacity = '0.5';
            this.disabled = true;
          });
        }
      });
    });
  }


  function initStatsCounter() {
    const statNumbers = document.querySelectorAll('.stat .num');
    statNumbers.forEach(stat => {
      const text = stat.textContent;
      const target = parseInt(text.replace(/[^0-9]/g, ''));
      if (!isNaN(target) && target > 0) {
        animateCounter(stat, target, text);
      }
    });
  }

  function animateCounter(element, target, originalText) {
    let current = 0;
    const increment = target / 30;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        element.textContent = originalText;
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(current);
      }
    }, 50);
  }

  function initModal() {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.id = 'modalOverlay';
    modalOverlay.innerHTML = `
      <div class="modal">
        <button class="close" onclick="closeModal()">&times;</button>
        <div class="modal-content"></div>
      </div>
    `;
    document.body.appendChild(modalOverlay);

    modalOverlay.addEventListener('click', function(e) {
      if (e.target === modalOverlay) closeModal();
    });
  }

  window.openModal = function(content) {
    const modal = document.getElementById('modalOverlay');
    if (modal) {
      modal.querySelector('.modal-content').innerHTML = content;
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeModal = function() {
    const modal = document.getElementById('modalOverlay');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  window.contactDonor = function(donorId) {
    openModal(`
      <h3>Contact Donor</h3>
      <div class="form-grid">
        <div>
          <label>Your Name</label>
          <input class="input" id="contactName" placeholder="Your full name">
        </div>
        <div>
          <label>Phone Number</label>
          <input class="input" id="contactPhone" placeholder="Your phone number">
        </div>
        <div style="grid-column: 1/-1">
          <label>Message</label>
          <textarea class="input" id="contactMessage" rows="3" placeholder="I need blood donation for..."></textarea>
        </div>
      </div>
      <div class="cta-row" style="margin-top: 16px">
        <button class="btn" onclick="sendContactRequest()">Send Request</button>
        <button class="btn secondary" onclick="closeModal()">Cancel</button>
      </div>
    `);
  };

  window.sendContactRequest = function() {
    const name = document.getElementById('contactName')?.value;
    const phone = document.getElementById('contactPhone')?.value;
    
    if (!name || !phone) {
      showToast('Please fill in your name and phone number', 'error');
      return;
    }
    
    showToast('Request sent! The donor will contact you soon.', 'success');
    closeModal();
  };

  window.callDonor = function(phone) {
    window.location.href = 'tel:' + phone;
  };

  function initTabs() {
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', function() {
        const tabName = this.dataset.tab || this.dataset.adminTab;
        if (!tabName) return;
        
        document.querySelectorAll('.tab, [data-admin-tab]').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        
        document.querySelectorAll('.tab-content, .admin-tab-content').forEach(content => {
          content.style.display = 'none';
        });
        
        const targetContent = document.getElementById('tab-' + tabName) || document.getElementById('admin-tab-' + tabName);
        if (targetContent) {
          targetContent.style.display = 'block';
        }
      });
    });
  }

  const bloodRequestForm = document.getElementById('bloodRequestForm');
  if (bloodRequestForm) {
    bloodRequestForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const submitBtn = bloodRequestForm.querySelector('button[type="submit"]');
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;

      setTimeout(function() {
        showToast('Blood request submitted!', 'success');
        bloodRequestForm.reset();
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
      }, 800);
    });
  }

  const saveProfileBtn = document.getElementById('saveProfileBtn');
  if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', function() {
      showToast('Profile saved successfully!', 'success');
    });
  }

  document.querySelectorAll('.filter-pill').forEach(function(pill) {
    pill.addEventListener('click', function() {
      document.querySelectorAll('.filter-pill').forEach(function(p) { p.classList.remove('active'); });
      this.classList.add('active');
      showToast('Filter applied - connect to backend for real filtering', 'info');
    });
  });

  window.filterByPill = function(btn) {
    document.querySelectorAll('.filter-pill').forEach(function(p) { p.classList.remove('active'); });
    btn.classList.add('active');
    showToast('Filtering donors...', 'info');
  };

  window.sortDonors = function(value) {
    showToast('Sorting by ' + value, 'info');
  };

  window.acceptRequest = function(btn) {
    const row = btn.closest('tr');
    row.style.opacity = '0.5';
    btn.disabled = true;
    showToast('Request accepted!', 'success');
  };

  window.declineRequest = function(btn) {
    const row = btn.closest('tr');
    row.style.opacity = '0.5';
    btn.disabled = true;
    showToast('Request declined', 'info');
  };

})();(function(){


  const API = {
    baseDelay: 300,
    
    // Simulate API endpoint
    async request(endpoint, options = {}) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const response = this.handleRequest(endpoint, options);
          resolve(response);
        }, this.baseDelay + Math.random() * 200);
      });
    },

    handleRequest(endpoint, options) {
      const { method = 'GET', body = {} } = options;
      
      switch(endpoint) {
        case 'GET /api/donors':
          return this.filterDonors(body);
        case 'GET /api/requests':
          return this.getRequests(body);
        case 'POST /api/requests':
          return this.createRequest(body);
        case 'POST /api/contact':
          return { success: true, message: 'Contact request sent' };
        case 'GET /api/stats':
          return this.getStats();
        case 'GET /api/hospitals':
          return this.getHospitals();
        default:
          return { error: 'Endpoint not found' };
      }
    },


    getDatabase() {
      return {
        donors: [
          { id: 1, name: 'Akash Rahman', bloodType: 'B-', location: 'Mirpur, Dhaka', phone: '01700000000', email: 'akash@email.com', available: true, lastDonated: '2025-01-15', totalDonations: 3, distance: 2.5 },
          { id: 2, name: 'Nusrat Jahan', bloodType: 'O+', location: 'Uttara, Dhaka', phone: '01711111111', email: 'nusrat@email.com', available: false, lastDonated: '2025-02-20', totalDonations: 5, distance: 4.2 },
          { id: 3, name: 'Mahin Ahmed', bloodType: 'AB-', location: 'Dhanmondi, Dhaka', phone: '01722222222', email: 'mahin@email.com', available: true, lastDonated: '2024-09-10', totalDonations: 2, distance: 1.8 },
          { id: 4, name: 'Sara Khan', bloodType: 'A+', location: 'Gulshan, Dhaka', phone: '01733333333', email: 'sara@email.com', available: true, lastDonated: '2025-03-01', totalDonations: 8, distance: 6.1 },
          { id: 5, name: 'Rahim Miya', bloodType: 'B+', location: 'Banani, Dhaka', phone: '01744444444', email: 'rahim@email.com', available: false, lastDonated: '2024-12-15', totalDonations: 4, distance: 3.9 },
          { id: 6, name: 'Fatema Begum', bloodType: 'A-', location: 'Mirpur, Dhaka', phone: '01755555555', email: 'fatema@email.com', available: true, lastDonated: '2025-01-28', totalDonations: 6, distance: 2.1 },
          { id: 7, name: 'Jamal Hossain', bloodType: 'O-', location: 'Savar, Dhaka', phone: '01766666666', email: 'jamal@email.com', available: true, lastDonated: '2024-11-05', totalDonations: 1, distance: 12.5 },
          { id: 8, name: 'Anika Rahman', bloodType: 'AB+', location: 'Gulshan, Dhaka', phone: '01777777777', email: 'anika@email.com', available: true, lastDonated: '2025-02-14', totalDonations: 7, distance: 5.8 },
          { id: 9, name: 'Khalid Hasan', bloodType: 'B-', location: 'Uttara, Dhaka', phone: '01788888888', email: 'khalid@email.com', available: true, lastDonated: '2024-10-20', totalDonations: 3, distance: 3.5 },
          { id: 10, name: 'Mithila Islam', bloodType: 'O+', location: 'Dhanmondi, Dhaka', phone: '01799999999', email: 'mithila@email.com', available: false, lastDonated: '2025-03-10', totalDonations: 4, distance: 1.2 }
        ],
        requests: [
          { id: 1, name: 'Rafiq Ahmed', bloodType: 'B-', hospital: 'Square Hospital', urgency: 'Emergency', phone: '01800000000', location: 'Dhaka', notes: 'Surgery required', status: 'pending', createdAt: '2025-04-20T08:00:00' },
          { id: 2, name: 'Sumaiya Begum', bloodType: 'B-', hospital: 'IBN Sina, Dhanmondi', urgency: 'Within 24h', phone: '01811111111', location: 'Dhanmondi', notes: 'For scheduled surgery', status: 'pending', createdAt: '2025-04-20T10:30:00' },
          { id: 3, name: 'Karim Ahmed', bloodType: 'O+', hospital: 'Apollo Hospital', urgency: 'Flexible', phone: '01822222222', location: 'Gulshan', notes: 'Regular checkup', status: 'matched', createdAt: '2025-04-19T14:00:00' }
        ],
        hospitals: [
          { id: 1, name: 'Square Hospital', location: 'Dhaka', phone: '02-12345678', requests: 45, active: true },
          { id: 2, name: 'IBN Sina Hospital', location: 'Dhaka', phone: '02-23456789', requests: 38, active: true },
          { id: 3, name: 'Apollo Hospital', location: 'Dhaka', phone: '02-34567890', requests: 29, active: true },
          { id: 4, name: 'Popular Diagnostic', location: 'Dhaka', phone: '02-45678901', requests: 22, active: true },
          { id: 5, name: 'BSMMU', location: 'Dhaka', phone: '02-56789012', requests: 18, active: true }
        ]
      };
    },

    filterDonors(filters = {}) {
      let donors = this.getDatabase().donors;
      
      if (filters.bloodType && filters.bloodType !== 'Any') {
        donors = donors.filter(d => d.bloodType === filters.bloodType);
      }
      if (filters.location) {
        donors = donors.filter(d => 
          d.location.toLowerCase().includes(filters.location.toLowerCase())
        );
      }
      if (filters.availableOnly) {
        donors = donors.filter(d => d.available);
      }
      if (filters.radius) {
        const radiusMap = { '5': 5, '10': 10, '25': 25, 'any': 100 };
        const maxDist = radiusMap[filters.radius] || 100;
        donors = donors.filter(d => d.distance <= maxDist);
      }
      
      // Sort by distance
      donors.sort((a, b) => a.distance - b.distance);
      
      return { success: true, data: donors, total: donors.length };
    },

    getRequests(filters = {}) {
      let requests = this.getDatabase().requests;
      
      if (filters.status) {
        requests = requests.filter(r => r.status === filters.status);
      }
      if (filters.bloodType) {
        requests = requests.filter(r => r.bloodType === filters.bloodType);
      }
      
      return { success: true, data: requests };
    },

    createRequest(data) {
      const newRequest = {
        id: Date.now(),
        ...data,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      return { success: true, data: newRequest };
    },

    getStats() {
      const db = this.getDatabase();
      return {
        success: true,
        data: {
          totalDonors: db.donors.length,
          activeDonors: db.donors.filter(d => d.available).length,
          totalRequests: db.requests.length,
          pendingRequests: db.requests.filter(r => r.status === 'pending').length,
          successfulMatches: 234,
          avgResponseTime: '15 min'
        }
      };
    },

    getHospitals() {
      return { success: true, data: this.getDatabase().hospitals };
    }
  };

  // Expose API globally
  window.BloodConnectAPI = API;

  // --- Theme Toggle ---
  const root = document.documentElement;
  const toggleBtn = document.getElementById('themeToggle');
  const themeLabel = document.getElementById('themeLabel');

  function applyTheme(theme){
    if(theme === 'dark'){
      root.classList.add('dark');
      toggleBtn?.setAttribute('aria-pressed','true');
      if(themeLabel) themeLabel.textContent = 'Dark Mode';
    } else {
      root.classList.remove('dark');
      toggleBtn?.setAttribute('aria-pressed','false');
      if(themeLabel) themeLabel.textContent = 'Light Mode';
    }
  }

  const saved = localStorage.getItem('bc-theme');
  if(saved){
    applyTheme(saved);
  } else {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  }

  if(toggleBtn){
    toggleBtn.addEventListener('click', function(e){
      const isDark = document.documentElement.classList.toggle('dark');
      const theme = isDark ? 'dark' : 'light';
      localStorage.setItem('bc-theme', theme);
      applyTheme(theme);
    });
  }

  // --- Highlight current navigation link ---
  document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop();
    document.querySelectorAll('.nav a.link').forEach(link => {
      if (link.getAttribute('href') === currentPage) {
        link.classList.add('active');
      }
    });
  
    initSearchFilter();
    initDonorCards();
    initRequestActions();
    initStatsCounter();
    initModal();
  });


  function showToast(message, type = 'info', duration = 3000) {
    document.querySelectorAll('.toast').forEach(t => t.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
      <span class="toast-icon">${getToastIcon(type)}</span>
      <span class="toast-message">${message}</span>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideIn 0.3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  function getToastIcon(type) {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[type] || icons.info;
  }

  // ============================================
  // Blood Type Compatibility
  // ============================================
  const bloodCompatibility = {
    'O-': ['O-'],
    'O+': ['O+', 'O-'],
    'A-': ['A-', 'O-'],
    'A+': ['A+', 'A-', 'O+', 'O-'],
    'B-': ['B-', 'O-'],
    'B+': ['B+', 'B-', 'O+', 'O-'],
    'AB-': ['AB-', 'A-', 'B-', 'O-'],
    'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  };

  // ============================================
  // Local Storage Data Management
  // ============================================
  const STORAGE_KEYS = {
    donors: 'bc-donors',
    requests: 'bc-requests',
    user: 'bc-user',
    notifications: 'bc-notifications'
  };

  // Sample data for demonstration
  const sampleDonors = [
    { id: 1, name: 'Akash Rahman', bloodType: 'B-', location: 'Mirpur, Dhaka', phone: '01700000000', available: true, lastDonated: '2025-01-15', totalDonations: 3 },
    { id: 2, name: 'Nusrat Jahan', bloodType: 'O+', location: 'Uttara, Dhaka', phone: '01711111111', available: false, lastDonated: '2025-02-20', totalDonations: 5 },
    { id: 3, name: 'Mahin Ahmed', bloodType: 'AB-', location: 'Dhanmondi, Dhaka', phone: '01722222222', available: true, lastDonated: '2024-09-10', totalDonations: 2 },
    { id: 4, name: 'Sara Khan', bloodType: 'A+', location: 'Gulshan, Dhaka', phone: '01733333333', available: true, lastDonated: '2025-03-01', totalDonations: 8 },
    { id: 5, name: 'Rahim Miya', bloodType: 'B+', location: 'Banani, Dhaka', phone: '01744444444', available: false, lastDonated: '2024-12-15', totalDonations: 4 }
  ];

  const sampleRequests = [
    { id: 1, name: 'Rafiq Ahmed', bloodType: 'B-', hospital: 'Square Hospital', urgency: 'Emergency', phone: '01800000000', status: 'pending' },
    { id: 2, name: 'Sumaiya Begum', bloodType: 'B-', hospital: 'IBN Sina, Dhanmondi', urgency: 'Within 24h', phone: '01811111111', status: 'pending' }
  ];

  // Initialize sample data if empty
  function initSampleData() {
    if (!localStorage.getItem(STORAGE_KEYS.donors)) {
      localStorage.setItem(STORAGE_KEYS.donors, JSON.stringify(sampleDonors));
    }
    if (!localStorage.getItem(STORAGE_KEYS.requests)) {
      localStorage.setItem(STORAGE_KEYS.requests, JSON.stringify(sampleRequests));
    }
  }
  initSampleData();

  window.bloodConnect = {
    getCompatibleDonors: function(recipientBloodType) {
      return bloodCompatibility[recipientBloodType] || [];
    },
    showToast: showToast,
    
    saveBloodRequest: function(data) {
      try {
        const requests = JSON.parse(localStorage.getItem(STORAGE_KEYS.requests) || '[]');
        const newRequest = { 
          ...data, 
          id: Date.now(), 
          createdAt: new Date().toISOString(),
          status: 'pending'
        };
        requests.unshift(newRequest);
        localStorage.setItem(STORAGE_KEYS.requests, JSON.stringify(requests));
        
        // Create notification for donors
        this.createNotification({
          type: 'new_request',
          title: 'New Blood Request',
          message: `Urgent: ${data.bloodType} blood needed at ${data.hospital}`,
          bloodType: data.bloodType
        });
        
        return { success: true, request: newRequest };
      } catch (e) {
        console.error('Failed to save request:', e);
        return { success: false, error: 'Failed to save request' };
      }
    },

    getBloodRequests: function() {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.requests) || '[]');
    },

    saveDonor: function(data) {
      try {
        const donors = JSON.parse(localStorage.getItem(STORAGE_KEYS.donors) || '[]');
        const existingIndex = donors.findIndex(d => d.id === data.id);
        if (existingIndex >= 0) {
          donors[existingIndex] = { ...donors[existingIndex], ...data, updatedAt: new Date().toISOString() };
        } else {
          donors.push({ ...data, id: Date.now(), createdAt: new Date().toISOString() });
        }
        localStorage.setItem(STORAGE_KEYS.donors, JSON.stringify(donors));
        return { success: true };
      } catch (e) {
        return { success: false, error: 'Failed to save donor' };
      }
    },

    getDonors: function(filters = {}) {
      let donors = JSON.parse(localStorage.getItem(STORAGE_KEYS.donors) || '[]');
      
      if (filters.bloodType && filters.bloodType !== 'Any') {
        donors = donors.filter(d => d.bloodType === filters.bloodType);
      }
      if (filters.location) {
        donors = donors.filter(d => d.location.toLowerCase().includes(filters.location.toLowerCase()));
      }
      if (filters.availableOnly) {
        donors = donors.filter(d => d.available);
      }
      return donors;
    },

    // Notification system
    createNotification: function(data) {
      const notifications = JSON.parse(localStorage.getItem(STORAGE_KEYS.notifications) || '[]');
      notifications.unshift({ ...data, id: Date.now(), read: false, createdAt: new Date().toISOString() });
      localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(notifications));
      updateNotificationBadge();
    },

    getNotifications: function() {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.notifications) || '[]');
    },

    markNotificationRead: function(id) {
      const notifications = this.getNotifications();
      const idx = notifications.findIndex(n => n.id === id);
      if (idx >= 0) {
        notifications[idx].read = true;
        localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(notifications));
        updateNotificationBadge();
      }
    },

    // Stats
    getStats: function() {
      const donors = this.getDonors();
      const requests = this.getBloodRequests();
      return {
        totalDonors: donors.length,
        activeDonors: donors.filter(d => d.available).length,
        totalRequests: requests.length,
        pendingRequests: requests.filter(r => r.status === 'pending').length,
        successfulMatches: Math.floor(Math.random() * 50) + 100 // Demo value
      };
    }
  };

  // ============================================
  // Search & Filter Functionality
  // ============================================
  function initSearchFilter() {
    const searchBtn = document.getElementById('searchBtn');
    const bloodSelect = document.getElementById('bloodTypeFilter');
    const locationInput = document.getElementById('locationFilter');
    const radiusSelect = document.querySelector('.form-grid select:nth-of-type(2)');
    const resultsContainer = document.getElementById('donorsList');
    
    if (searchBtn && bloodSelect && locationInput) {
      searchBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        
        // Show loading state
        searchBtn.classList.add('loading');
        searchBtn.disabled = true;
        searchBtn.textContent = 'Searching...';
        
        if (resultsContainer) {
          resultsContainer.innerHTML = `
            <div class="loading-state">
              <div class="spinner"></div>
              <p>Searching for donors...</p>
            </div>
          `;
        }
        
        const filters = {
          bloodType: bloodSelect.value,
          location: locationInput.value,
          radius: radiusSelect?.value?.includes('5') ? '5' : 
                  radiusSelect?.value?.includes('10') ? '10' : 
                  radiusSelect?.value?.includes('25') ? '25' : 'any',
          availableOnly: false
        };
        
        try {
          // Use API to fetch donors
          const response = await BloodConnectAPI.request('GET /api/donors', { body: filters });
          
          setTimeout(() => {
            if (response.success && response.data.length > 0) {
              renderDonorCards(response.data);
              showToast(`Found ${response.total} donor(s) near you!`, 'success');
            } else {
              renderDonorCards([]);
              showToast('No donors found matching your criteria', 'warning');
            }
            
            searchBtn.classList.remove('loading');
            searchBtn.disabled = false;
            searchBtn.textContent = 'Search';
          }, 500);
          
        } catch (error) {
          showToast('Search failed. Please try again.', 'error');
          searchBtn.classList.remove('loading');
          searchBtn.disabled = false;
          searchBtn.textContent = 'Search';
        }
      });
      
      // Also trigger search on Enter key
      locationInput?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          searchBtn.click();
        }
      });
    }
  }

  function renderDonorsList(donors) {
    const container = document.getElementById('donorsList');
    if (!container) return;
    
    if (!donors || donors.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div style="font-size: 48px; margin-bottom: 16px;">🔍</div>
          <h3>No Donors Found</h3>
          <p class="small">Try adjusting your search criteria or expanding the radius</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = donors.map(donor => `
      <div class="donor-card" data-id="${donor.id}">
        <div class="header">
          <div class="name">
            <div class="avatar">${donor.name.split(' ').map(n => n[0]).join('')}</div>
            <div>
              <div>${donor.name}</div>
              <span class="small" style="color: var(--muted);">${donor.distance} km away</span>
            </div>
          </div>
          <span class="badge ${donor.available ? 'available' : 'unavailable'}">
            ${donor.available ? 'Available' : 'Not Available'}
          </span>
        </div>
        <div class="details">
          <span>🩸 ${donor.bloodType}</span>
          <span>📍 ${donor.location}</span>
          <span>📅 Last: ${donor.lastDonated || 'N/A'}</span>
          <span>❤️ ${donor.totalDonations || 0} donations</span>
        </div>
        <div class="actions">
          ${donor.available ? `
            <button class="btn" onclick="contactDonor(${donor.id})">Contact</button>
            <button class="btn secondary" onclick="callDonor('${donor.phone}')">📞 Call</button>
          ` : `
            <button class="btn secondary" disabled style="opacity:0.5">Not Available</button>
          `}
        </div>
      </div>
    `).join('');
  }

  // ============================================
  // Donor Card Interactions
  // ============================================
  function initDonorCards() {
    // Make donor cards interactive if they exist
    const donorCards = document.querySelectorAll('.donor-card, .cards.card > div');
    donorCards.forEach(card => {
      card.style.cursor = 'pointer';
      card.addEventListener('click', function(e) {
        if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') return;
        this.classList.toggle('expanded');
      });
    });
  }

  // ============================================
  // Request Actions (Accept/Decline)
  // ============================================
  function initRequestActions() {
    document.querySelectorAll('table').forEach(table => {
      const rows = table.querySelectorAll('tbody tr');
      rows.forEach(row => {
        const acceptBtn = row.querySelector('.btn:not(.secondary)');
        const declineBtn = row.querySelector('.btn.secondary');
        
        if (acceptBtn) {
          acceptBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showToast('Request accepted! The patient will be notified.', 'success');
            this.closest('tr').style.opacity = '0.5';
            this.disabled = true;
          });
        }
        
        if (declineBtn) {
          declineBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showToast('Request declined', 'info');
            this.closest('tr').style.opacity = '0.5';
            this.disabled = true;
          });
        }
      });
    });
  }

  // ============================================
  // Stats Counter Animation
  // ============================================
  function initStatsCounter() {
    const statNumbers = document.querySelectorAll('.stat .num');
    statNumbers.forEach(stat => {
      const target = parseInt(stat.textContent);
      if (!isNaN(target)) {
        animateCounter(stat, target);
      }
    });
  }

  function animateCounter(element, target) {
    let current = 0;
    const increment = target / 30;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        element.textContent = target;
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(current);
      }
    }, 50);
  }

  // ============================================
  // Modal System
  // ============================================
  function initModal() {
    // Create modal container
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.id = 'modalOverlay';
    modalOverlay.innerHTML = `
      <div class="modal">
        <button class="close" onclick="closeModal()">&times;</button>
        <div class="modal-content"></div>
      </div>
    `;
    document.body.appendChild(modalOverlay);

    modalOverlay.addEventListener('click', function(e) {
      if (e.target === modalOverlay) closeModal();
    });
  }

  window.openModal = function(content) {
    const modal = document.getElementById('modalOverlay');
    if (modal) {
      modal.querySelector('.modal-content').innerHTML = content;
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeModal = function() {
    const modal = document.getElementById('modalOverlay');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  // ============================================
  // Contact Functions
  // ============================================
  window.contactDonor = function(donorId) {
    const donors = window.bloodConnect.getDonors();
    const donor = donors.find(d => d.id === donorId);
    if (donor) {
      openModal(`
        <h3>Contact ${donor.name}</h3>
        <div class="form-grid">
          <div>
            <label>Your Name</label>
            <input class="input" id="contactName" placeholder="Your full name">
          </div>
          <div>
            <label>Phone Number</label>
            <input class="input" id="contactPhone" placeholder="Your phone number">
          </div>
          <div style="grid-column: 1/-1">
            <label>Message</label>
            <textarea class="input" id="contactMessage" rows="3" placeholder="I need blood donation for..."></textarea>
          </div>
        </div>
        <div class="cta-row" style="margin-top: 16px">
          <button class="btn" onclick="sendContactRequest(${donorId})">Send Request</button>
          <button class="btn secondary" onclick="closeModal()">Cancel</button>
        </div>
      `);
    }
  };

  window.sendContactRequest = function(donorId) {
    const name = document.getElementById('contactName')?.value;
    const phone = document.getElementById('contactPhone')?.value;
    const message = document.getElementById('contactMessage')?.value;
    
    if (!name || !phone) {
      showToast('Please fill in your name and phone number', 'error');
      return;
    }
    
    showToast('Request sent! The donor will contact you soon.', 'success');
    closeModal();
  };

  window.callDonor = function(phone) {
    window.location.href = `tel:${phone}`;
  };

  // ============================================
  // Notification Badge Update
  // ============================================
  function updateNotificationBadge() {
    const notifications = window.bloodConnect.getNotifications();
    const unread = notifications.filter(n => !n.read).length;
    
    let badge = document.querySelector('.notification-badge');
    if (!badge && unread > 0) {
      badge = document.createElement('span');
      badge.className = 'notification-badge';
      badge.style.cssText = 'background: var(--danger); color: #fff; padding: 2px 6px; border-radius: 10px; font-size: 11px;';
      const navLink = document.querySelector('a[href="dashboard.html"]');
      if (navLink) navLink.appendChild(badge);
    }
    if (badge) {
      badge.textContent = unread;
      badge.style.display = unread > 0 ? 'inline' : 'none';
    }
  }

  // ============================================
  // Blood Request Form Handler
  // ============================================
  const bloodRequestForm = document.getElementById('bloodRequestForm');
  if (bloodRequestForm) {
    bloodRequestForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const submitBtn = bloodRequestForm.querySelector('button[type="submit"]');
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;

      const formData = {
        name: bloodRequestForm.querySelector('input[placeholder="Full Name"]')?.value,
        phone: bloodRequestForm.querySelector('input[placeholder="017XXXXXXXX"]')?.value,
        bloodType: bloodRequestForm.querySelector('select')?.value,
        urgency: bloodRequestForm.querySelectorAll('select')[1]?.value,
        hospital: bloodRequestForm.querySelector('input[placeholder="Hospital name, area"]')?.value,
        notes: bloodRequestForm.querySelector('textarea')?.value
      };

      setTimeout(() => {
        const result = window.bloodConnect.saveBloodRequest(formData);
        
        if (result.success) {
          showToast('Blood request submitted! Donors will be notified.', 'success');
          bloodRequestForm.reset();
        } else {
          showToast('Failed to submit request. Please try again.', 'error');
        }
        
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
      }, 800);
    });
  }

  // ============================================
  // Dashboard Save Handler
  // ============================================
  const saveBtn = document.querySelector('a[href="#"]');
  if (saveBtn && saveBtn.textContent.includes('Save')) {
    saveBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      const nameInput = document.querySelector('input[value="Your Name"]');
      const bloodSelect = document.querySelector('select');
      const locationInput = document.querySelector('input[value="Dhanmondi, Dhaka"]');
      const phoneInput = document.querySelector('input[value="017XXXXXXXX"]');
      const availabilitySelect = document.querySelectorAll('select')[1];

      const donorData = {
        name: nameInput?.value,
        bloodType: bloodSelect?.value,
        location: locationInput?.value,
        phone: phoneInput?.value,
        available: availabilitySelect?.value === 'Available'
      };

      const result = window.bloodConnect.saveDonor(donorData);
      showToast(
        result.success ? 'Profile saved successfully!' : 'Failed to save profile.',
        result.success ? 'success' : 'error'
      );
    });
  }

  // Expose render function globally
  window.renderDonorCards = renderDonorsList;

  // ============================================
  // Tab Functionality
  // ============================================
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function() {
      const tabName = this.dataset.tab;
      
      // Update active tab
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      // Show corresponding content
      document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
      });
      const targetContent = document.getElementById(`tab-${tabName}`);
      if (targetContent) {
        targetContent.style.display = 'block';
      }
    });
  });

  // ============================================
  // Filter Pills Functionality
  // ============================================
  document.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', function() {
      document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      this.classList.add('active');
      
      const filter = this.dataset.filter;
      filterByPill(this, filter);
    });
  });

  // Global filter function for pills
  window.filterByPill = async function(btn, filter) {
    const searchBtn = document.getElementById('searchBtn');
    const container = document.getElementById('donorsList');
    
    if (searchBtn) {
      searchBtn.classList.add('loading');
      searchBtn.disabled = true;
    }
    
    if (container) {
      container.innerHTML = `
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Filtering donors...</p>
        </div>
      `;
    }
    
    try {
      const response = await BloodConnectAPI.request('GET /api/donors', { body: {} });
      let donors = response.data || [];
      
      if (filter === 'available') {
        donors = donors.filter(d => d.available);
      } else if (filter !== 'all') {
        donors = donors.filter(d => d.bloodType === filter);
      }
      
      setTimeout(() => {
        renderDonorsList(donors);
        updateResultsHeader(donors.length);
        
        if (searchBtn) {
          searchBtn.classList.remove('loading');
          searchBtn.disabled = false;
        }
        
        showToast(`Showing ${donors.length} donor(s)`, 'info');
      }, 300);
      
    } catch (error) {
      showToast('Filter failed', 'error');
      if (searchBtn) {
        searchBtn.classList.remove('loading');
        searchBtn.disabled = false;
      }
    }
  };

  // Sort donors function
  window.sortDonors = async function(sortBy) {
    const container = document.getElementById('donorsList');
    
    if (container) {
      container.innerHTML = `
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Sorting...</p>
        </div>
      `;
    }
    
    try {
      const response = await BloodConnectAPI.request('GET /api/donors', { body: {} });
      let donors = response.data || [];
      
      switch(sortBy) {
        case 'distance':
          donors.sort((a, b) => a.distance - b.distance);
          break;
        case 'donations':
          donors.sort((a, b) => (b.totalDonations || 0) - (a.totalDonations || 0));
          break;
        case 'recent':
          donors.sort((a, b) => new Date(b.lastDonated) - new Date(a.lastDonated));
          break;
      }
      
      setTimeout(() => {
        renderDonorsList(donors);
      }, 200);
      
    } catch (error) {
      showToast('Sort failed', 'error');
    }
  };

  // Update results header
  function updateResultsHeader(count) {
    const header = document.getElementById('resultsHeader');
    const countSpan = document.getElementById('resultsCount');
    
    if (header && countSpan) {
      countSpan.textContent = count;
      header.style.display = count > 0 ? 'flex' : 'none';
    }
  }

  // ============================================
  // API Console Toggle
  // ============================================
  window.toggleApiConsole = function() {
    const console = document.getElementById('apiConsole');
    console?.classList.toggle('expanded');
  };

  // Log API calls
  window.logApiCall = function(method, endpoint, status) {
    const logs = document.getElementById('apiLogs');
    if (logs) {
      const entry = document.createElement('div');
      entry.className = `log-entry ${method.toLowerCase()}`;
      entry.innerHTML = `
        <span class="method">${method}</span>
        <span class="endpoint">${endpoint}</span>
        <span class="status">${status}</span>
      `;
      logs.insertBefore(entry, logs.firstChild);
    }
  };

  // ============================================
  // Accept/Decline Request Functions
  // ============================================
  window.acceptRequest = function(btn) {
    const row = btn.closest('tr');
    row.style.opacity = '0.5';
    btn.disabled = true;
    row.querySelector('.btn.secondary')?.remove();
    showToast('Request accepted! Contact info sent to patient.', 'success');
  };

  window.declineRequest = function(btn) {
    const row = btn.closest('tr');
    row.style.opacity = '0.5';
    btn.disabled = true;
    row.querySelector('.btn:not(.secondary)')?.remove();
    showToast('Request declined', 'info');
  };

  // ============================================
  // Admin Tab Functionality
  // ============================================
  document.querySelectorAll('[data-admin-tab]').forEach(tab => {
    tab.addEventListener('click', function() {
      const tabName = this.dataset.adminTab;
      
      document.querySelectorAll('[data-admin-tab]').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      document.querySelectorAll('.admin-tab-content').forEach(content => {
        content.style.display = 'none';
      });
      const targetContent = document.getElementById(`admin-tab-${tabName}`);
      if (targetContent) {
        targetContent.style.display = 'block';
      }
    });
  });

  // ============================================
  // Dashboard Profile Save
  // ============================================
  const saveProfileBtn = document.getElementById('saveProfileBtn');
  if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', function() {
      const donorData = {
        name: document.getElementById('profileName')?.value,
        bloodType: document.getElementById('profileBlood')?.value,
        location: document.getElementById('profileLocation')?.value,
        phone: document.getElementById('profilePhone')?.value,
        available: document.getElementById('profileAvailability')?.value === 'Available'
      };

      const result = window.bloodConnect.saveDonor(donorData);
      showToast(
        result.success ? 'Profile saved successfully!' : 'Failed to save profile.',
        result.success ? 'success' : 'error'
      );
    });
  }

})();
