# -----------------------------------------------------------------------------
# Project : Datawrapper
# -----------------------------------------------------------------------------
# Author : Edouard Richard                                  <edou4rd@gmail.com>
# -----------------------------------------------------------------------------
# License : GNU Lesser General Public License
# -----------------------------------------------------------------------------
# Creation : 21-Nov-2012
# Last mod : 12-Dec-2012
# -----------------------------------------------------------------------------
#  
#  Command to compile the coffee scripts, join then into 
#  www/static/js/srccoffee-compiled.js and watch for change (-w):
#    > coffee -o www/static/js/src -j coffee-compiled.js -wc www/static/js/src/coffee

window.datawrapper  = {}
Widget              = window.serious.Widget

AJAX_USERS          = '/api/users'
AJAX_SALT           = '/api/auth/salt'
AJAX_ACCOUNT        = '/api/account'
AJAX_RESET_PASSWORD = '/api/account/reset-password'
# -----------------------------------------------------------------------------
#
# ADMIN USER WIDGET
#
# -----------------------------------------------------------------------------
class datawrapper.AdminUsers extends Widget

	constructor: ->
		@UIS = {
			usersContainer   : '.users'
			userTmpl         : '.user.template'
			emailField       : 'input[name=email]'
			addButton        : 'input[name=addUser]'
			statusField      : 'select[name=status]'
			msgDeleteSuccess : '.delete-succeed'
			msgError         : '.alert-error'
			msgAddSuccess    : '.add-success'
			loading          : '.loading'
			confirmNewAdmin  : '.confirm-admin-new'
			confirmLostAdmin : '.confirm-admin-lost'
			confirmDeleteUser: '.confirm-delete'
		}
		@ACTIONS  = ['addUserAction', 'deleteAction', 'toggleAdminAction', 'getUsers']
		@cache    = {
			users       : null
			salt        : null
			time        : null
			currentUser : null
		}

	bindUI: (ui) =>
		super
		this.getSalt() # async
		this.getCurrentUser() # synchrone
		this.showUsers()

	# -------------------------------------------------------------------------
	# UI
	# -------------------------------------------------------------------------
	showUsers: (refresh=false) =>
		# load users list if needed
		if not @cache.users? or refresh
			@cache.users = null
			return this.getUsers()
		# remove previous users
		@uis.usersContainer.find('.actual').remove()
		# generating the list
		for user in @cache.users
			if user.Email != 'DELETED'
				nui = this.fabricUserEntry(user)
				@uis.usersContainer.prepend(nui)

	fabricUserEntry: (user) =>
		nui = this.cloneTemplate(@uis.userTmpl, {
			id       : user.Id
			email    : user.Email
			status   : user.Role
			creation : user.CreatedAt
		}).attr('data-userid', user.Id)
		if user.ActivateToken != null and user.ActivateToken != ''
			nui.addClass('pending')
		if user.Role == 'admin'
			nui.addClass('admin')
			nui.find('input[name=isAdmin]').prop('checked', true)
		else
			nui.find('input[name=isAdmin]').prop('checked', false)
		# remove action button for current user
		if user.Id == @cache.currentUser.Id
			nui.find('.action').addClass('hidden')
		return nui

	onUsersLoaded: (data) =>
		@cache.users = data.data
		this.showUsers()

	hideMessages: =>
		@uis.msgAddSuccess.addClass 'hidden'
		@uis.msgDeleteSuccess.addClass 'hidden'
		@uis.msgError.addClass 'hidden'

	enableLoading: =>
		@uis.loading.removeClass('hidden')
		@uis.addButton.prop('disabled', true)

	disableLoading: =>
		@uis.loading.addClass('hidden')
		@uis.addButton.prop('disabled', false)

	# -------------------------------------------------------------------------
	# ACTIONS
	# -------------------------------------------------------------------------
	addUserAction: (e) =>
		this.hideMessages() # reset messages
		email    = @uis.emailField.val()
		status   = @uis.statusField.val()
		this.addUser(email, status)
	
	deleteAction: (e) =>
		this.hideMessages() # reset messages
		id = $(e.currentTarget).parents('.user').attr('data-userid')
		this.deleteUser(id)

	toggleAdminAction: (e) => 
		this.hideMessages() # reset messages
		id   = $(e.currentTarget).parents('.user').attr('data-userid')
		user = this.getUserById(id)
		if user.Role == 'admin'
			# set a normal role
			if confirm("#{user.Email} #{@uis.confirmLostAdmin.text()}")
				this.toggleAdmin(id, false)
		else
			# set a admin role
			if confirm("#{user.Email} #{@uis.confirmNewAdmin.text()}")
				this.toggleAdmin(id, true)

	# -------------------------------------------------------------------------
	# AJAX
	# -------------------------------------------------------------------------
	getUsers: =>
		$.ajax(AJAX_USERS, {dataType: 'json', success:this.onUsersLoaded})

	addUser: (email, status) =>
		this.enableLoading()
		$.ajax(AJAX_USERS, {
			dataType : 'json'
			type     : 'POST'
			data     : JSON.stringify {
				email      : email
				role       : status
				invitation : true
			}
			success  : (data) =>
				this.disableLoading()
				if data.status == 'ok'
					user = data.data
					# show message
					this.set('email', user.Email, @uis.msgAddSuccess)
					@uis.msgAddSuccess.removeClass('hidden')
					# add user to the list
					nui = this.fabricUserEntry(user).addClass('warning')
					@uis.usersContainer.prepend(nui)
					@cache.users.push(user)
					# clean fields
					@uis.emailField.val('')
				else if data.status == 'error'
					# show message
					@uis.msgError.filter(".error-#{data.message}").removeClass('hidden')
					# refresh the list
					this.showUsers(refresh=true)
				else
					this.showUsers(refresh=true) 
		})

	deleteUser: (id) =>
		user = this.getUserById(id)
		if confirm("#{user.Email} #{@uis.confirmDeleteUser.text()}")
			$.ajax("#{AJAX_USERS}/#{id}", {
				dataType : 'json'
				type     : 'DELETE'
				success  : (data) =>
					# refresh users list
					if data.status == 'ok'
						this.showUsers(refresh=true)
						# show message
						this.set('email', user.Email, @uis.msgDeleteSuccess)
						@uis.msgDeleteSuccess.removeClass('hidden')
			})

	toggleAdmin: (id, admin=false) =>
		user          = this.getUserById(id)
		role_to_set   = if admin then 'admin' else 'editor'
		$.ajax("#{AJAX_USERS}/#{id}", {
			dataType : 'json'
			type     : 'PUT'
			data     : JSON.stringify({role : role_to_set})
			success  : (data) =>
				if data.status == 'ok' and 'role' in data.data.updated
					# update list
					user.Role    = role_to_set
					previous_nui = @uis.usersContainer.find("[data-userid=#{id}]")
					previous_nui.replaceWith(this.fabricUserEntry(user))
		})

	getSalt: =>
		$.ajax(AJAX_SALT, {
			dataType : 'json'
			success  : (res) =>
				if res.status == 'ok'
					@cache.salt  = res.data.salt
		})

	getCurrentUser: =>
		$.ajax(AJAX_ACCOUNT, {
			dataType : 'json'
			async    : false
			success  : (res) =>
				if res.status == 'ok'
					@cache.currentUser  = res.data.user
		})

	# -------------------------------------------------------------------------
	# UTILS
	# -------------------------------------------------------------------------
	getUserById: (id) =>
		for user in @cache.users
			if user.Id == parseInt(id)
				return user
		return null

# -----------------------------------------------------------------------------
#
# INVITATION FORM WIDGET
#
# -----------------------------------------------------------------------------
# TODO:
#  [ ] Loading annimation
#  [ ] Check password before send
class datawrapper.InvitationForm extends Widget

	constructor: ->
		@UIS = {
			pwd1     : 'input[name=password1]'
			pwd2     : 'input[name=password2]'
			msgError : '.error'
		}
		@ACTIONS  = ['send']
		@cache    = {
			salt : null
		}

	bindUI: (ui) =>
		super
		this.getSalt() # async

	send: =>
		@uis.msgError.addClass('hidden')
		pwd1 = if @uis.pwd1.val() != '' then CryptoJS.HmacSHA256(@uis.pwd1.val(), @cache.salt).toString() else ''
		pwd2 = if @uis.pwd2.val() != '' then CryptoJS.HmacSHA256(@uis.pwd2.val(), @cache.salt).toString() else ''
		$.ajax('/api'+document.location.pathname, {
			dataType : 'json'
			type     : 'POST'
			data     : JSON.stringify {
				pwd1 : pwd1
				pwd2 : pwd2
			}
			success  : (data) =>
				if data.status == 'ok'
					# redirect to home
					window.location = '/'
				else
					@uis.msgError.removeClass('hidden').find('div').text(data.message)
		})

	getSalt: =>
		$.ajax(AJAX_SALT, {
			dataType : 'json'
			success  : (res) =>
				if res.status == 'ok'
					@cache.salt  = res.data.salt
		})

$(document).ready => Widget.bindAll()

# EOF
