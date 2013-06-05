# -----------------------------------------------------------------------------
# Project : Datawrapper
# -----------------------------------------------------------------------------
# Author : Edouard Richard                                  <edou4rd@gmail.com>
# -----------------------------------------------------------------------------
# License : MIT Licence
# -----------------------------------------------------------------------------
# Creation : 29-May-2013
# Last mod : 05-Jun-2013
# -----------------------------------------------------------------------------
window.admin_users = {}

Widget   = window.serious.Widget
# URL      = new window.serious.URL()
# Format   = window.serious.format
# Utils    = window.serious.Utils
States   = new window.serious.States()

AJAX_USERS          = '/api/users'
AJAX_SALT           = '/api/auth/salt'
AJAX_ACCOUNT        = '/api/account'
AJAX_RESET_PASSWORD = '/api/account/reset-password'
# -----------------------------------------------------------------------------
#
#    Admin Users: add/edit/delete users
#
# -----------------------------------------------------------------------------
class admin_users.AdminUsers extends Widget

	constructor: ->
		@UIS = {
			usersList         : '.users'
			emailField        : 'input[name=email]'
			statusField       : 'select[name=status]'
			loading           : '.loading'
			addButton         : 'input[name=addUser]'
			confirmDeleteUser : '.confirm-delete'
			editionTmpl       : '.user.edition.template'
			msgError          : '.alert-error'
		}
		@ACTIONS = ['showAddUserForm', 'addUserAction', 'removeAction', 'editAction', 'saveAction', 'cancelAction']

		@cache = {
			editedUser : null
		}

	bindUI: (ui) =>
		super
		States.set('addUserForm', false)

	editUser: (id) =>
		this.cancelAction()
		@cache.editedUser = this.__getUserById(id) # save edtied user
		nui = this.cloneTemplate(@uis.editionTmpl, {
			id       : @cache.editedUser.Id
			creation : @cache.editedUser.CreatedAt
		})
		nui.find(".email input").val(@cache.editedUser.Email)
		nui.find("select[name=status] option[value=#{@cache.editedUser.Role}]").attr('selected', 'selected')
		current_line = @uis.usersList.find(".user[data-id=#{@cache.editedUser.Id}]")
		current_line.addClass('hidden').after(nui)

	enableLoading: =>
		@uis.loading.removeClass('hidden')
		@uis.addButton.prop('disabled', true)

	disableLoading: =>
		@uis.loading.addClass('hidden')
		@uis.addButton.prop('disabled', false)

	hideMessages: =>
		@uis.msgError.addClass 'hidden'
	# -----------------------------------------------------------------------------
	#    ACTIONS
	# -----------------------------------------------------------------------------
	addUserAction: (evnt) =>
		this.hideMessages()
		email  = @uis.emailField.val()
		status = @uis.statusField.val()
		this.addUser(email, status)

	showAddUserForm: (evnt) =>
		this.hideMessages()
		States.set('addUserForm', true)

	removeAction: (evnt) =>
		this.hideMessages()
		this.removeUser($(evnt.currentTarget).data('id'))

	editAction: (evnt) =>
		this.hideMessages()
		this.editUser($(evnt.currentTarget).data('id'))

	saveAction: (evnt) =>
		this.hideMessages()
		### Prepare the new user object and call the update method ###
		$row   = @uis.usersList.find(".user.edition.actual")
		email  = $row.find(".email input").val()
		status = $row.find("select[name=status]").val()
		user = @cache.editedUser
		@cache.editedUser.Role  = status
		@cache.editedUser.Email = email
		this.updateUser(@cache.editedUser)

	cancelAction: (evnt) =>
		this.hideMessages()
		### Cancel the edition mode, reset the orginal row ###
		if @cache.editedUser?
			$edited_row = @uis.usersList.find(".user.edition.actual")
			$edited_row.prev('.user').removeClass('hidden')
			$edited_row.remove()
			@cache.editedUser = null

	# -----------------------------------------------------------------------------
	#    CRUD
	#       After each operation, the page is reloaded
	# -----------------------------------------------------------------------------
	__getUserById: (id) =>
		res = $.ajax("#{AJAX_USERS}/#{id}", {async : false}).responseText
		res = eval('(' + res + ')')
		if res.status == "ok"
			return res.data

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
			success : (data) =>
				this.disableLoading()
				if data.status == "error"
					@uis.msgError.filter(".error-#{data.message}").removeClass('hidden')
				else
					window.location.reload()
			error   : => window.location.reload()
		})

	removeUser: (id) =>
		user = this.__getUserById(id)
		if confirm("#{user.Email} #{@uis.confirmDeleteUser.text()}")
			$.ajax("#{AJAX_USERS}/#{id}", {
				dataType : 'json'
				type     : 'DELETE'
				data     :  JSON.stringify {pwd:"pouet"} # hack for API
				success : (data) =>
					this.disableLoading()
					if data.status == "error"
						@uis.msgError.filter(".error-#{data.message}").removeClass('hidden')
					else
						window.location.reload()
				error   : => window.location.reload()
			})

	updateUser: (user) =>
		$.ajax("#{AJAX_USERS}/#{user.Id}", {
			dataType : 'json'
			type     : 'PUT'
			data     : JSON.stringify({role : user.Role, email: user.Email})
			success : (data) =>
				this.disableLoading()
				if data.data.errors?
					@uis.msgError.filter(".error-#{data.data.errors[0]}").removeClass('hidden')
				else
					window.location.reload()
			error   : => window.location.reload()
		})

# -----------------------------------------------------------------------------
#
#    MAIN FUNCTION
#
# -----------------------------------------------------------------------------
$(window).load ()->
	Widget.bindAll()
