const PORT = process.env.PORT || 3189
const express = require('express')
const app = express()
var request = require('request-promise-native')

const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()

async function login(jar, client_id, email, password, login_type) {
  const body = await request.post('https://ssl.jobcan.jp/login/pc-employee/old', {jar, followAllRedirects: true, form: {
    client_id, email, password, login_type, url: '/employee'
  }})
  return Promise.resolve(body)
}

async function audit(jar, adit_group_id, token) {
  return request.post('https://ssl.jobcan.jp/employee/index/adit', {jar, form: {
    adit_group_id, adit_item: 'DEF', is_yakin: 0, token, notice: ''
  }})
}

app.post('/stamp', jsonParser, async (req, res) => {
  try {
    const jar = request.jar()
    const clientIid = req.body.client_id
    const email = req.body.email
    const password = req.body.password
    const loginType = req.body.login_type
    const body = await login(jar, clientIid, email, password, loginType)
    let match = body.match(/<input type="hidden" class="token" name="token" value="(.*?)">/)
    if (!match) throw "can't get token"
    const token = match[1]
    match = body.match(/<option value="(.*?)"/)
    if (!match) throw "can't get group id"
    const aditGroupId = match[1]
    const test = await audit(jar, aditGroupId, token)
    res.send(test)
  } catch (e) {
    console.log(e)
    res.send(e)
  }
})

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`))
