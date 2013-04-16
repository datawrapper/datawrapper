

sys = require 'system'
fs = require 'fs'
yaml = require './lib/yamlparser.js'

config = yaml.eval fs.read '../config.yaml'

domain = 'http://' + config.domain

if sys.env.DATAWRAPPER_DOMAIN?
    domain = sys.env.DATAWRAPPER_DOMAIN

testuser = "testuser-" + Math.floor(Math.random()*100000) + "@localhost"

console.log 'testing on '+domain

# no need to change anything below this line

casper = require('casper').create
    verbose: false
    logLevel: "debug"

casper.setFilter 'page.confirm', (message) ->
    true


register = (user, pass) ->
    # register new user
    casper.then () ->
        # click login button to open modal
        @evaluate () ->
            $('a.btn-login').click()
        @test.assertMatch @getElementAttribute('body', 'class'), /modal-open/, 'modal window has opened'
        # @echo "login form is here!"
        # sign up a new user
        @test.assertExists('#register-email', 'form input for registration exists')
        @evaluate (user, pass) ->
            $('#register-email').val user
            $('#register-pwd').val pass
            $('#register-pwd-2').val pass
            $('#btn-register').click()
        , testuser, '123456'

    # check if registration was successful
    casper.then () ->
        casper.waitForSelector '.signup-form .alert', () ->
            @test.assertMatch @getElementAttribute('.signup-form .alert', 'class'), /alert-success/, 'account '+testuser+' created'

    # check if login was successful
    casper.then () ->
        @reload () ->
            @test.assertExists '#dw-header-link-user', 'logged in after sign up'


logout = () ->
    # log out
    casper.then () ->
        @evaluate () ->
            $('a[href=#logout]').click()
    # check if we're logged out
    casper.then () ->
        @wait 1000, () ->
            @test.assertExists '#dw-header-link-login', 'logged out'

login = (user, pass) ->
    # fill login form
    casper.then () ->
        @test.assertExists '.login-form .login-email', 'login form exists'
        @evaluate (user, pass) ->
            $('.login-form .login-email').val user
            $('.login-form .login-pwd').val pass
            $('.login-form .btn-login').click()
        , user, pass
    # check login
    casper.then () ->
        @waitForResource @getCurrentUrl(), () ->
            @test.assertMatch @getHTML('#dw-header-link-user'), /testuser/, 'logged in'

setProfile = (name, website, socialmedia) ->
    # move to settings page, insert name and website
    casper.thenOpen domain + '/account/settings', () ->
        @test.assertExists '.mysettings', 'moved to settings page'
        @evaluate (name, website, socialmedia) ->
            $('input#name').val name
            $('input#website').val website
            $('input#socialmedia').val socialmedia
            __utils__.mouseEvent 'click', '#save-profile'
        , name, website, socialmedia
    # check if profile was updated correctly
    casper.then () ->
        casper.waitForSelector '.profile .alert', () ->
            @test.assertMatch @getElementAttribute('.profile  .alert', 'class'), /alert-success/, 'success message after profile change'
            @reload () ->
                @test.assertEquals @getElementAttribute('input#name', 'value'), name, 'name correctly set'
                @test.assertEquals @getElementAttribute('input#website', 'value'), website, 'website correctly set'
                @test.assertEquals @getElementAttribute('input#socialmedia', 'value'), socialmedia, 'social media profile correctly set'

changePassword = (oldpw, newpw) ->
    # change password
    casper.thenOpen domain + '/account/settings', () ->
        @evaluate (oldpw, newpw) ->
            $('input#cur-pwd').val oldpw
            $('input#pwd').val newpw
            $('input#pwd2').val newpw
            __utils__.mouseEvent 'click', '#change-password'
        , oldpw, newpw

    # success message
    casper.then () ->
        @waitForSelector '.password .alert', () ->
            @test.assertMatch @getElementAttribute('.password  .alert', 'class'), /alert-success/, 'changed password'
    # logout and try loggin in with new password
    logout()
    login testuser, newpw

resendActivation = () ->
    casper.thenOpen domain + '/account/settings', () ->
        @evaluate () ->
            __utils__.mouseEvent 'click', '#resend-activation-link'
    casper.then () ->
        @waitForResource @getCurrentUrl(), () ->
            @test.assertExists 'li .alert-success', 'resend activation email'

createChart = (i=0, el='rect', num=7) ->
    chartId = 0
    casper.thenOpen domain + '/chart/create', () ->
        @test.assertNotEquals @getCurrentUrl(), domain + '/chart/create', 'redirected to chart editor'
        chartId = @getCurrentUrl().substr(domain.length + 7, 5)
        @test.assertExists '#upload-data-text', 'created chart ' + chartId
        data = @evaluate (i) ->
            a = $($('#demo-datasets a').get(i))
            a.click()
            [a.data('data'), $('#upload-data-text').val()]
        , i
        @test.assertEquals data[0], data[1], 'loaded dataset from example '+i
        @evaluate () ->
            $('#upload-data').click()

    casper.then () ->
        casper.waitForResource 'describe', () ->
            @test.assert true, 'entered describe step'
            # check if table preview is populated with some data
            @test.assertEval () ->
                $('table#data-preview tr').length > 2
            , 'data has been stored'

            @evaluate () ->
                $('#describe-source-name').focus()
                document.querySelector('#describe-source-name').value = "My Source"
                $('#describe-source-name').blur()

    casper.then () ->
        @waitForResource 'api/charts', () ->
            @open domain + '/chart/' + chartId + '/visualize', () ->
                @test.assertExists '#iframe-wrapper', 'entered visualize step'

    casper.then () ->
        [url, name] = @evaluate () ->
            iframe = $('body', $('#iframe-vis').contents())
            a = $('a.source', iframe)
            if a.length == 1
                [a.attr('href'), a.html()]
            else
                ['', '']
        @test.assertEquals name, "My Source", "correct source name"

        n = @evaluate (el, num) ->
            iframe = $('body', $('#iframe-vis').contents())
            $(el, iframe).length
        , el, num
        @test.assertEquals n, num, "found "+num+" elements of type '"+el+"'"

        @open domain + '/chart/' + chartId + '/publish', () ->
            @test.assertExists '.dw-create-publish h3', "entered publish step"


checkMyCharts = (expected, filterBy, filterVal) ->
    url = '/mycharts'
    if filterBy and filterVal
        url += '/by/' + filterBy + '/' + filterVal
    casper.thenOpen domain + url, () ->
        num = @evaluate () ->
            $('.thumbnail').length
        @test.assertEquals num, expected, "found "+expected+" chart on mycharts page "+filterVal


deleteChart = () ->
    casper.thenOpen domain + '/mycharts', () ->
        @test.assertExists 'li.chart a.delete', "found chart deletion link"
        @evaluate () ->
            __utils__.mouseEvent 'click', 'li.chart:first-child a.delete'


deleteAccount = (pass) ->
    casper.thenOpen domain + '/account/settings', () ->
        @test.assertExists '#delete-account', 'found account deletion button'

    casper.thenEvaluate () ->
        __utils__.mouseEvent 'click', '#are-you-sure'
        __utils__.mouseEvent 'click', '#delete-account'

    casper.then () ->
        @test.assertVisible '#confirmDeletion', 'deletion modal appeared'

    casper.thenEvaluate (pass) ->
        document.getElementById('confirm-pwd').setAttribute('value', pass)
        $('#really-delete-account').click()
    , pass

    casper.then () ->
        @waitForResource 'api/users/current', () ->
            @test.assertDoesntExist '#confirmDeletion .alert-error', 'no error shown after account deletion'
            @test.assertVisible '.post-delete', 'account deletion confirmed'
            if @exists '.alert-error'
                @echo @getHTML('.alert-error'), 'ERROR'
        @evaluate () ->
            $('.post-delete .btn').click()  # close confirmation window
    casper.thenOpen domain + '/', () ->
        @test.assertExists '#dw-header-link-login', 'not logged in anymore'
    # check if login fails




# open datawrapper frontpage and check title

casper.start domain + '/', () ->
    @test.assertTitle 'Datawrapper', 'Website has correct title'

register testuser, '123456'
logout()
login testuser, '123456'
setProfile 'Testuser', 'http://testuser.org', 'http://twitter.com/testuser'
changePassword '123456', '1234'
resendActivation()
checkMyCharts 0
createChart 0, 'rect', 7
checkMyCharts 1
createChart 1, 'path', 10
checkMyCharts 2
checkMyCharts 1, 'vis', 'line-chart'
deleteChart()
checkMyCharts 1
deleteAccount '1234'

casper.run()