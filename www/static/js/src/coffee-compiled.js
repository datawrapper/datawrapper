(function() {
  var AJAX_ACCOUNT, AJAX_RESET_PASSWORD, AJAX_SALT, AJAX_USERS, Widget, isDefined,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    _this = this;

  window.serious = {};

  window.serious.Utils = {};

  isDefined = function(obj) {
    return typeof obj !== 'undefined' && obj !== null;
  };

  jQuery.fn.opacity = function(o) {
    return $(this).css({
      opacity: o
    });
  };

  window.serious.Utils.clone = function(obj) {
    var flags, key, newInstance;
    if (!(obj != null) || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof RegExp) {
      flags = '';
      if (obj.global != null) flags += 'g';
      if (obj.ignoreCase != null) flags += 'i';
      if (obj.multiline != null) flags += 'm';
      if (obj.sticky != null) flags += 'y';
      return new RegExp(obj.source, flags);
    }
    newInstance = new obj.constructor();
    for (key in obj) {
      newInstance[key] = window.serious.Utils.clone(obj[key]);
    }
    return newInstance;
  };

  jQuery.fn.cloneTemplate = function(dict, removeUnusedField) {
    var klass, nui, value;
    if (removeUnusedField == null) removeUnusedField = false;
    nui = $(this[0]).clone();
    nui = nui.removeClass("template hidden").addClass("actual");
    if (typeof dict === "object") {
      for (klass in dict) {
        value = dict[klass];
        if (value !== null) nui.find(".out." + klass).html(value);
      }
      if (removeUnusedField) {
        nui.find(".out").each(function() {
          if ($(this).html() === "") return $(this).remove();
        });
      }
    }
    return nui;
  };

  window.serious.Widget = (function() {

    function Widget() {
      this.cloneTemplate = __bind(this.cloneTemplate, this);
      this.show = __bind(this.show, this);
      this.hide = __bind(this.hide, this);
      this.set = __bind(this.set, this);
    }

    Widget.bindAll = function() {
      return $(".widget").each(function() {
        return Widget.ensureWidget($(this));
      });
    };

    Widget.ensureWidget = function(ui) {
      var widget, widget_class;
      ui = $(ui);
      if (ui[0]._widget != null) {
        return ui[0]._widget;
      } else {
        widget_class = Widget.getWidgetClass(ui);
        if (widget_class != null) {
          widget = new widget_class();
          widget.bindUI(ui);
          return widget;
        } else {
          console.warn("widget not found for", ui);
          return null;
        }
      }
    };

    Widget.getWidgetClass = function(ui) {
      return eval("(" + $(ui).attr("data-widget") + ")");
    };

    Widget.prototype.bindUI = function(ui) {
      var action, key, nui, value, _i, _len, _ref, _ref2, _results;
      this.ui = $(ui);
      if (this.ui[0]._widget) delete this.ui[0]._widget;
      this.ui[0]._widget = this;
      this.uis = {};
      if (typeof this.UIS !== "undefined") {
        _ref = this.UIS;
        for (key in _ref) {
          value = _ref[key];
          nui = this.ui.find(value);
          if (nui.length < 1) console.warn("uis", key, "not found in", ui);
          this.uis[key] = nui;
        }
      }
      if (typeof this.ACTIONS !== "undefined") {
        _ref2 = this.ACTIONS;
        _results = [];
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          action = _ref2[_i];
          _results.push(this._bindClick(this.ui.find(".do[data-action=" + action + "]"), action));
        }
        return _results;
      }
    };

    Widget.prototype.set = function(field, value, context) {
      context = context || this.ui;
      context.find(".out[data-field=" + field + "]").html(value);
      return context;
    };

    Widget.prototype.hide = function() {
      return this.ui.addClass("hidden");
    };

    Widget.prototype.show = function() {
      return this.ui.removeClass("hidden");
    };

    Widget.prototype.cloneTemplate = function(template_nui, dict, removeUnusedField) {
      var action, action_name, actions, klass, nui, value, _i, _len;
      if (removeUnusedField == null) removeUnusedField = false;
      nui = template_nui.clone();
      nui = nui.removeClass("template hidden").addClass("actual");
      if (typeof dict === "object") {
        for (klass in dict) {
          value = dict[klass];
          if (value !== null) nui.find(".out." + klass).html(value);
        }
        if (removeUnusedField) {
          nui.find(".out").each(function() {
            if ($(this).html() === "") return $(this).remove();
          });
        }
      }
      actions = nui.find(".do");
      for (_i = 0, _len = actions.length; _i < _len; _i++) {
        action = actions[_i];
        action = $(action);
        action_name = action.data("action");
        this._bindClick(action, action_name);
      }
      return nui;
    };

    Widget.prototype._bindClick = function(nui, action) {
      var _this = this;
      if ((action != null) && __indexOf.call(this.ACTIONS, action) >= 0) {
        return nui.click(function(e) {
          _this[action](e);
          return e.preventDefault();
        });
      }
    };

    return Widget;

  })();

  window.serious.URL = (function() {

    function URL() {
      this.toString = __bind(this.toString, this);
      this.fromString = __bind(this.fromString, this);
      this.enableLinks = __bind(this.enableLinks, this);
      this.updateUrl = __bind(this.updateUrl, this);
      this.hasBeenAdded = __bind(this.hasBeenAdded, this);
      this.hasChanged = __bind(this.hasChanged, this);
      this.remove = __bind(this.remove, this);
      this.update = __bind(this.update, this);
      this.set = __bind(this.set, this);
      this.onStateChanged = __bind(this.onStateChanged, this);
      this.get = __bind(this.get, this);
      var _this = this;
      this.previousHash = [];
      this.handlers = [];
      this.hash = this.fromString(location.hash);
      $(window).hashchange(function() {
        var handler, _i, _len, _ref, _results;
        _this.previousHash = window.serious.Utils.clone(_this.hash);
        _this.hash = _this.fromString(location.hash);
        _ref = _this.handlers;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          handler = _ref[_i];
          _results.push(handler());
        }
        return _results;
      });
    }

    URL.prototype.get = function(field) {
      if (field == null) field = null;
      if (field) {
        return this.hash[field];
      } else {
        return this.hash;
      }
    };

    URL.prototype.onStateChanged = function(handler) {
      return this.handlers.push(handler);
    };

    URL.prototype.set = function(fields, silent) {
      var hash, key, value;
      if (silent == null) silent = false;
      hash = silent ? this.hash : window.serious.Utils.clone(this.hash);
      hash = [];
      for (key in fields) {
        value = fields[key];
        if (isDefined(value)) hash[key] = value;
      }
      return this.updateUrl(hash);
    };

    URL.prototype.update = function(fields, silent) {
      var hash, key, value;
      if (silent == null) silent = false;
      hash = silent ? this.hash : window.serious.Utils.clone(this.hash);
      for (key in fields) {
        value = fields[key];
        if (isDefined(value)) {
          hash[key] = value;
        } else {
          delete hash[key];
        }
      }
      return this.updateUrl(hash);
    };

    URL.prototype.remove = function(key, silent) {
      var hash;
      if (silent == null) silent = false;
      hash = silent ? this.hash : window.serious.Utils.clone(this.hash);
      if (hash[key]) delete hash[key];
      return this.updateUrl(hash);
    };

    URL.prototype.hasChanged = function(key) {
      if (this.hash[key] != null) {
        if (this.previousHash[key] != null) {
          return this.hash[key].toString() !== this.previousHash[key].toString();
        } else {
          return true;
        }
      } else {
        if (this.previousHash[key] != null) return true;
      }
      return false;
    };

    URL.prototype.hasBeenAdded = function(key) {
      return console.error("not implemented");
    };

    URL.prototype.updateUrl = function(hash) {
      if (hash == null) hash = null;
      return location.hash = this.toString(hash);
    };

    URL.prototype.enableLinks = function(context) {
      var _this = this;
      if (context == null) context = null;
      return $("a.internal[href]", context).click(function(e) {
        var href, link;
        link = $(e.currentTarget);
        href = link.attr("data-href") || link.attr("href");
        if (href[0] === "#") {
          if (href.length > 1 && href[1] === "+") {
            _this.update(_this.fromString(href.slice(2)));
          } else if (href.length > 1 && href[1] === "-") {
            _this.remove(_this.fromString(href.slice(2)));
          } else {
            _this.set(_this.fromString(href.slice(1)));
          }
        }
        return false;
      });
    };

    URL.prototype.fromString = function(value) {
      var hash, item, key, key_value, val, _i, _len;
      value = value || location.hash;
      hash = [];
      value = value.split("&");
      for (_i = 0, _len = value.length; _i < _len; _i++) {
        item = value[_i];
        if (item != null) {
          key_value = item.split("=");
          if (key_value.length === 2) {
            key = key_value[0].replace("#", "");
            val = key_value[1].replace("#", "");
            hash[key] = val;
          }
        }
      }
      return hash;
    };

    URL.prototype.toString = function(hash_list) {
      var key, new_hash, value;
      if (hash_list == null) hash_list = null;
      hash_list = hash_list || this.hash;
      new_hash = "";
      for (key in hash_list) {
        value = hash_list[key];
        new_hash += "&" + key + "=" + value;
      }
      return new_hash;
    };

    return URL;

  })();

  window.datawrapper = {};

  Widget = window.serious.Widget;

  AJAX_USERS = '/api/users';

  AJAX_SALT = '/api/auth/salt';

  AJAX_ACCOUNT = '/api/account';

  AJAX_RESET_PASSWORD = '/api/account/reset-password';

  datawrapper.AdminUsers = (function(_super) {

    __extends(AdminUsers, _super);

    function AdminUsers() {
      this.getUserById = __bind(this.getUserById, this);
      this.getCurrentUser = __bind(this.getCurrentUser, this);
      this.getSalt = __bind(this.getSalt, this);
      this.toggleAdmin = __bind(this.toggleAdmin, this);
      this.deleteUser = __bind(this.deleteUser, this);
      this.addUser = __bind(this.addUser, this);
      this.getUsers = __bind(this.getUsers, this);
      this.toggleAdminAction = __bind(this.toggleAdminAction, this);
      this.deleteAction = __bind(this.deleteAction, this);
      this.addUserAction = __bind(this.addUserAction, this);
      this.disableLoading = __bind(this.disableLoading, this);
      this.enableLoading = __bind(this.enableLoading, this);
      this.hideMessages = __bind(this.hideMessages, this);
      this.onUsersLoaded = __bind(this.onUsersLoaded, this);
      this.fabricUserEntry = __bind(this.fabricUserEntry, this);
      this.showUsers = __bind(this.showUsers, this);
      this.bindUI = __bind(this.bindUI, this);      this.UIS = {
        usersContainer: '.users',
        userTmpl: '.user.template',
        emailField: 'input[name=email]',
        addButton: 'input[name=addUser]',
        statusField: 'select[name=status]',
        msgDeleteSuccess: '.delete-succeed',
        msgError: '.alert-error',
        msgAddSuccess: '.add-success',
        loading: '.loading',
        confirmNewAdmin: '.confirm-admin-new',
        confirmLostAdmin: '.confirm-admin-lost',
        confirmDeleteUser: '.confirm-delete'
      };
      this.ACTIONS = ['addUserAction', 'deleteAction', 'toggleAdminAction', 'getUsers'];
      this.cache = {
        users: null,
        salt: null,
        time: null,
        currentUser: null
      };
    }

    AdminUsers.prototype.bindUI = function(ui) {
      AdminUsers.__super__.bindUI.apply(this, arguments);
      this.getSalt();
      this.getCurrentUser();
      return this.showUsers();
    };

    AdminUsers.prototype.showUsers = function(refresh) {
      var nui, user, _i, _len, _ref, _results;
      if (refresh == null) refresh = false;
      if (!(this.cache.users != null) || refresh) {
        this.cache.users = null;
        return this.getUsers();
      }
      this.uis.usersContainer.find('.actual').remove();
      _ref = this.cache.users;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        user = _ref[_i];
        if (user.Email !== 'DELETED') {
          nui = this.fabricUserEntry(user);
          _results.push(this.uis.usersContainer.prepend(nui));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    AdminUsers.prototype.fabricUserEntry = function(user) {
      var nui;
      nui = this.cloneTemplate(this.uis.userTmpl, {
        id: user.Id,
        email: user.Email,
        status: user.Role,
        creation: user.CreatedAt
      }).attr('data-userid', user.Id);
      if (user.ActivateToken !== null && user.ActivateToken !== '') {
        nui.addClass('pending');
      }
      if (user.Role === 'admin') {
        nui.addClass('admin');
        nui.find('input[name=isAdmin]').prop('checked', true);
      } else {
        nui.find('input[name=isAdmin]').prop('checked', false);
      }
      if (user.Id === this.cache.currentUser.Id) {
        nui.find('.action').addClass('hidden');
      }
      return nui;
    };

    AdminUsers.prototype.onUsersLoaded = function(data) {
      this.cache.users = data.data;
      return this.showUsers();
    };

    AdminUsers.prototype.hideMessages = function() {
      this.uis.msgAddSuccess.addClass('hidden');
      this.uis.msgDeleteSuccess.addClass('hidden');
      return this.uis.msgError.addClass('hidden');
    };

    AdminUsers.prototype.enableLoading = function() {
      this.uis.loading.removeClass('hidden');
      return this.uis.addButton.prop('disabled', true);
    };

    AdminUsers.prototype.disableLoading = function() {
      this.uis.loading.addClass('hidden');
      return this.uis.addButton.prop('disabled', false);
    };

    AdminUsers.prototype.addUserAction = function(e) {
      var email, status;
      this.hideMessages();
      email = this.uis.emailField.val();
      status = this.uis.statusField.val();
      return this.addUser(email, status);
    };

    AdminUsers.prototype.deleteAction = function(e) {
      var id;
      this.hideMessages();
      id = $(e.currentTarget).parents('.user').attr('data-userid');
      return this.deleteUser(id);
    };

    AdminUsers.prototype.toggleAdminAction = function(e) {
      var id, user;
      this.hideMessages();
      id = $(e.currentTarget).parents('.user').attr('data-userid');
      user = this.getUserById(id);
      if (user.Role === 'admin') {
        if (confirm("" + user.Email + " " + (this.uis.confirmLostAdmin.text()))) {
          return this.toggleAdmin(id, false);
        }
      } else {
        if (confirm("" + user.Email + " " + (this.uis.confirmNewAdmin.text()))) {
          return this.toggleAdmin(id, true);
        }
      }
    };

    AdminUsers.prototype.getUsers = function() {
      return $.ajax(AJAX_USERS, {
        dataType: 'json',
        success: this.onUsersLoaded
      });
    };

    AdminUsers.prototype.addUser = function(email, status) {
      var _this = this;
      this.enableLoading();
      return $.ajax(AJAX_USERS, {
        dataType: 'json',
        type: 'POST',
        data: JSON.stringify({
          email: email,
          role: status,
          invitation: true
        }),
        success: function(data) {
          var nui, refresh, user;
          _this.disableLoading();
          if (data.status === 'ok') {
            user = data.data;
            _this.set('email', user.Email, _this.uis.msgAddSuccess);
            _this.uis.msgAddSuccess.removeClass('hidden');
            nui = _this.fabricUserEntry(user).addClass('warning');
            _this.uis.usersContainer.prepend(nui);
            _this.cache.users.push(user);
            return _this.uis.emailField.val('');
          } else if (data.status === 'error') {
            _this.uis.msgError.filter(".error-" + data.message).removeClass('hidden');
            return _this.showUsers(refresh = true);
          } else {
            return _this.showUsers(refresh = true);
          }
        }
      });
    };

    AdminUsers.prototype.deleteUser = function(id) {
      var user,
        _this = this;
      user = this.getUserById(id);
      if (confirm("" + user.Email + " " + (this.uis.confirmDeleteUser.text()))) {
        return $.ajax("" + AJAX_USERS + "/" + id, {
          dataType: 'json',
          type: 'DELETE',
          success: function(data) {
            var refresh;
            if (data.status === 'ok') {
              _this.showUsers(refresh = true);
              _this.set('email', user.Email, _this.uis.msgDeleteSuccess);
              return _this.uis.msgDeleteSuccess.removeClass('hidden');
            }
          }
        });
      }
    };

    AdminUsers.prototype.toggleAdmin = function(id, admin) {
      var role_to_set, user,
        _this = this;
      if (admin == null) admin = false;
      user = this.getUserById(id);
      role_to_set = admin ? 'admin' : 'editor';
      return $.ajax("" + AJAX_USERS + "/" + id, {
        dataType: 'json',
        type: 'PUT',
        data: JSON.stringify({
          role: role_to_set
        }),
        success: function(data) {
          var previous_nui;
          if (data.status === 'ok' && __indexOf.call(data.data.updated, 'role') >= 0) {
            user.Role = role_to_set;
            previous_nui = _this.uis.usersContainer.find("[data-userid=" + id + "]");
            return previous_nui.replaceWith(_this.fabricUserEntry(user));
          }
        }
      });
    };

    AdminUsers.prototype.getSalt = function() {
      var _this = this;
      return $.ajax(AJAX_SALT, {
        dataType: 'json',
        success: function(res) {
          if (res.status === 'ok') return _this.cache.salt = res.data.salt;
        }
      });
    };

    AdminUsers.prototype.getCurrentUser = function() {
      var _this = this;
      return $.ajax(AJAX_ACCOUNT, {
        dataType: 'json',
        async: false,
        success: function(res) {
          if (res.status === 'ok') return _this.cache.currentUser = res.data.user;
        }
      });
    };

    AdminUsers.prototype.getUserById = function(id) {
      var user, _i, _len, _ref;
      _ref = this.cache.users;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        user = _ref[_i];
        if (user.Id === parseInt(id)) return user;
      }
      return null;
    };

    return AdminUsers;

  })(Widget);

  datawrapper.InvitationForm = (function(_super) {

    __extends(InvitationForm, _super);

    function InvitationForm() {
      this.getSalt = __bind(this.getSalt, this);
      this.send = __bind(this.send, this);
      this.bindUI = __bind(this.bindUI, this);      this.UIS = {
        pwd1: 'input[name=password1]',
        pwd2: 'input[name=password2]',
        msgError: '.error'
      };
      this.ACTIONS = ['send'];
      this.cache = {
        salt: null
      };
    }

    InvitationForm.prototype.bindUI = function(ui) {
      InvitationForm.__super__.bindUI.apply(this, arguments);
      return this.getSalt();
    };

    InvitationForm.prototype.send = function() {
      var pwd1, pwd2,
        _this = this;
      this.uis.msgError.addClass('hidden');
      pwd1 = this.uis.pwd1.val() !== '' ? CryptoJS.HmacSHA256(this.uis.pwd1.val(), this.cache.salt).toString() : '';
      pwd2 = this.uis.pwd2.val() !== '' ? CryptoJS.HmacSHA256(this.uis.pwd2.val(), this.cache.salt).toString() : '';
      return $.ajax('/api' + document.location.pathname, {
        dataType: 'json',
        type: 'POST',
        data: JSON.stringify({
          pwd1: pwd1,
          pwd2: pwd2
        }),
        success: function(data) {
          if (data.status === 'ok') {
            return window.location = '/';
          } else {
            return _this.uis.msgError.removeClass('hidden').find('div').text(data.message);
          }
        }
      });
    };

    InvitationForm.prototype.getSalt = function() {
      var _this = this;
      return $.ajax(AJAX_SALT, {
        dataType: 'json',
        success: function(res) {
          if (res.status === 'ok') return _this.cache.salt = res.data.salt;
        }
      });
    };

    return InvitationForm;

  })(Widget);

  $(document).ready(function() {
    return Widget.bindAll();
  });

}).call(this);
