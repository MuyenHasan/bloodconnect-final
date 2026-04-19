(function() {

  // THEME TOGGLE
  var root = document.documentElement;
  var toggleBtn = document.getElementById('themeToggle');
  var themeLabel = document.getElementById('themeLabel');

  function applyTheme(theme) {
    if (theme === 'dark') {
      root.classList.add('dark');
      if (toggleBtn) toggleBtn.setAttribute('aria-pressed', 'true');
      if (themeLabel) themeLabel.textContent = 'Dark Mode';
    } else {
      root.classList.remove('dark');
      if (toggleBtn) toggleBtn.setAttribute('aria-pressed', 'false');
      if (themeLabel) themeLabel.textContent = 'Light Mode';
    }
  }

  // Load saved theme or use system preference
  var saved = localStorage.getItem('bc-theme');
  if (saved) {
    applyTheme(saved);
  } else {
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  }

  // Theme toggle click handler
  if (toggleBtn) {
    toggleBtn.addEventListener('click', function() {
      var isDark = root.classList.toggle('dark');
      localStorage.setItem('bc-theme', isDark ? 'dark' : 'light');
      applyTheme(isDark ? 'dark' : 'light');
    });
  }
  // HIGHLIGHT CURRENT NAVIGATION
  document.addEventListener('DOMContentLoaded', function() {
    var currentPage = window.location.pathname.split('/').pop();
    document.querySelectorAll('.nav a.link').forEach(function(link) {
      if (link.getAttribute('href') === currentPage) {
        link.classList.add('active');
      }
    });

    // Initialize all features
    initSearchFilter();
    initRequestActions();
    initStatsCounter();
    initModal();
    initTabs();
  });
  // TOAST NOTIFICATIONS
  function showToast(message, type, duration) {
    type = type || 'info';
    duration = duration || 3000;

    // Remove existing toasts
    document.querySelectorAll('.toast').forEach(function(t) {
      t.remove();
    });

    // Create new toast
    var toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.setAttribute('role', 'alert');
    toast.textContent = message;
    document.body.appendChild(toast);

    // Remove after duration
    setTimeout(function() {
      toast.style.animation = 'slideIn 0.3s ease reverse';
      setTimeout(function() {
        toast.remove();
      }, 300);
    }, duration);
  }

  // Expose to global
  window.bloodConnect = {
    showToast: showToast
  };
  // SEARCH FILTER
 
  function initSearchFilter() {
    var searchBtn = document.getElementById('searchBtn');
    var bloodSelect = document.getElementById('bloodTypeFilter');
    var locationInput = document.getElementById('locationFilter');

    if (searchBtn && bloodSelect && locationInput) {
      searchBtn.addEventListener('click', function(e) {
        e.preventDefault();
        searchBtn.classList.add('loading');
        searchBtn.disabled = true;

        setTimeout(function() {
          searchBtn.classList.remove('loading');
          searchBtn.disabled = false;
          showToast('Search ready - connect backend for real data', 'info');
        }, 500);
      });

      locationInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          searchBtn.click();
        }
      });
    }
  }

  // ============================================
  // TABLE ACTION BUTTONS (Accept/Decline)
  // ============================================
  function initRequestActions() {
    document.querySelectorAll('table').forEach(function(table) {
      table.querySelectorAll('tbody tr').forEach(function(row) {
        var acceptBtn = row.querySelector('.btn:not(.secondary)');
        var declineBtn = row.querySelector('.btn.secondary');

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
  // STATS COUNTER ANIMATION
  function initStatsCounter() {
    document.querySelectorAll('.stat .num').forEach(function(stat) {
      var text = stat.textContent;
      var target = parseInt(text.replace(/[^0-9]/g, ''));

      if (!isNaN(target) && target > 0) {
        var current = 0;
        var increment = target / 30;
        var timer = setInterval(function() {
          current += increment;
          if (current >= target) {
            stat.textContent = text;
            clearInterval(timer);
          } else {
            stat.textContent = Math.floor(current);
          }
        }, 50);
      }
    });
  }

  // MODAL SYSTEM
  function initModal() {
    var modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.id = 'modalOverlay';
    modalOverlay.innerHTML = '<div class="modal">' +
      '<button class="close" onclick="closeModal()">&times;</button>' +
      '<div class="modal-content"></div>' +
      '</div>';
    document.body.appendChild(modalOverlay);

    modalOverlay.addEventListener('click', function(e) {
      if (e.target === modalOverlay) {
        closeModal();
      }
    });
  }

  window.openModal = function(content) {
    var modal = document.getElementById('modalOverlay');
    if (modal) {
      modal.querySelector('.modal-content').innerHTML = content;
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeModal = function() {
    var modal = document.getElementById('modalOverlay');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  
  window.contactDonor = function(donorId) {
    openModal(
      '<h3>Contact Donor</h3>' +
      '<div class="form-grid">' +
        '<div><label>Your Name</label><input class="input" id="contactName" placeholder="Your full name"></div>' +
        '<div><label>Phone Number</label><input class="input" id="contactPhone" placeholder="Your phone number"></div>' +
        '<div style="grid-column:1/-1"><label>Message</label><textarea class="input" id="contactMessage" rows="3" placeholder="I need blood donation for..."></textarea></div>' +
      '</div>' +
      '<div class="cta-row" style="margin-top:16px">' +
        '<button class="btn" onclick="sendContactRequest()">Send Request</button>' +
        '<button class="btn secondary" onclick="closeModal()">Cancel</button>' +
      '</div>'
    );
  };

  window.sendContactRequest = function() {
    var name = document.getElementById('contactName').value;
    var phone = document.getElementById('contactPhone').value;

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
    document.querySelectorAll('.tab').forEach(function(tab) {
      tab.addEventListener('click', function() {
        var tabName = this.dataset.tab || this.dataset.adminTab;
        if (!tabName) return;

        // Remove active class from all tabs
        document.querySelectorAll('.tab, [data-admin-tab]').forEach(function(t) {
          t.classList.remove('active');
        });
        this.classList.add('active');

        // Hide all tab contents
        document.querySelectorAll('.tab-content, .admin-tab-content').forEach(function(content) {
          content.style.display = 'none';
        });

        // Show target tab content
        var targetContent = document.getElementById('tab-' + tabName) ||
                           document.getElementById('admin-tab-' + tabName);
        if (targetContent) {
          targetContent.style.display = 'block';
        }
      });
    });
  }

  
  var bloodRequestForm = document.getElementById('bloodRequestForm');
  if (bloodRequestForm) {
    bloodRequestForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var submitBtn = bloodRequestForm.querySelector('button[type="submit"]');
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

  
  // DASHBOARD PROFILE SAVE

  var saveProfileBtn = document.getElementById('saveProfileBtn');
  if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', function() {
      showToast('Profile saved successfully!', 'success');
    });
  }

  // FILTER PILLS
  
  document.querySelectorAll('.filter-pill').forEach(function(pill) {
    pill.addEventListener('click', function() {
      document.querySelectorAll('.filter-pill').forEach(function(p) {
        p.classList.remove('active');
      });
      this.classList.add('active');
      showToast('Filter applied', 'info');
    });
  });

  window.filterByPill = function(btn) {
    document.querySelectorAll('.filter-pill').forEach(function(p) {
      p.classList.remove('active');
    });
    btn.classList.add('active');
    showToast('Filtering donors...', 'info');
  };

  window.sortDonors = function(value) {
    showToast('Sorting by ' + value, 'info');
  };

  // ACCEPT/DECLINE REQUEST FUNCTIONS
  
  window.acceptRequest = function(btn) {
    var row = btn.closest('tr');
    row.style.opacity = '0.5';
    btn.disabled = true;
    showToast('Request accepted!', 'success');
  };

  window.declineRequest = function(btn) {
    var row = btn.closest('tr');
    row.style.opacity = '0.5';
    btn.disabled = true;
    showToast('Request declined', 'info');
  };

})();