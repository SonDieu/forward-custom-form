const inquirer = require("inquirer") // https://github.com/SBoudrias/Inquirer.js#question
const _axios = require("axios")
const _ = require("lodash")
let instance = null;

const defaultToken = `eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlEwWXdOekF5UTBFME1UTXdRa05FTWpWQ05rRTVSRFUxTURoRk16TXhNa1kyTVRFelFVSkJRUSJ9.eyJodHRwczovL2FwaS5za2VkdWxvLmNvbS91c2VyX2lkIjoib2F1dGgyfHNmLWJhdHMtc2FuZGJveHwwMDUyRTAwMDAwSXlTZDJRQUYiLCJodHRwczovL2FwaS5za2VkdWxvLmNvbS92ZW5kb3IiOiJzYWxlc2ZvcmNlIiwiaHR0cHM6Ly9hcGkuc2tlZHVsby5jb20vdXNlcm5hbWUiOiJhZG1pbkBza2VkdWxvLmNvbS5iYXRzLnVhdCIsImh0dHBzOi8vYXBpLnNrZWR1bG8uY29tL29yZ2FuaXphdGlvbl9pZCI6IjAwRDE5MDAwMDAwOWhtckVBQSIsImh0dHBzOi8vYXBpLnNrZWR1bG8uY29tL25hbWUiOiJTa2VkdWxvIEFkbWluIiwiaHR0cHM6Ly9hcGkuc2tlZHVsby5jb20vc2ZfZW52Ijoic2FsZXNmb3JjZS1zYW5kYm94IiwiaHR0cHM6Ly9hcGkuc2tlZHVsby5jb20vcmVzb3VyY2VfaWQiOiJhMEIxOTAwMDAwOEx0aGpFQUMiLCJodHRwczovL2FwaS5za2VkdWxvLmNvbS9yb2xlcyI6WyJzY2hlZHVsZXIiLCJ1c2VyIiwiYWRtaW5pc3RyYXRvciJdLCJodHRwczovL2FwaS5za2VkdWxvLmNvbS92ZW4iOnsiY29tbXVuaXR5X2lkIjpudWxsLCJ1c2VyX2lkIjoiMDA1MkUwMDAwMEl5U2QyUUFGIn0sImlzcyI6Imh0dHBzOi8vc2tlZHVsby5hdXRoMC5jb20vIiwic3ViIjoib2F1dGgyfHNmLWJhdHMtc2FuZGJveHwwMDUyRTAwMDAwSXlTZDJRQUYiLCJhdWQiOlsiaHR0cHM6Ly9hcGkuc2tlZHVsby5jb20iLCJodHRwczovL3NrZWR1bG8uYXV0aDAuY29tL3VzZXJpbmZvIl0sImlhdCI6MTU4NDQzNDA2NCwiZXhwIjoxNTg0NDc3MjY0LCJhenAiOiI5bUVKQzBxS0VaSW5UYThPMnVTMzBtZHdMVXlqNllySCIsInNjb3BlIjoib3BlbmlkIn0.f7wcZGn4fYZ8OzBi4YwNV-ud8T1Yn14AYRf5WrDcOVJfz-vZu3XTWxUyg6rSbUaUwT6qvLsTspqMzN2KxaY8hjLwZkPsH0W0d0hLeH_poEXEBxHT-eRV7wdx3kFnlaAhjV9YXQpOVSEQj_SH5t0KuC8Vi-NfV0XlRsBNkxywYCkW49BL-92iHQoKgaa_yHcg00KIVtS1PlNdt5D3gEiTzmGt2xHYsH8w_YjmftDB_pSWxnR4XIY9lTyvOJX6f8bCFLMbasjKuu3HFBSHZvxr7t-Ak0ob9hHBlhYksD4XBM7_VRtC8nZPkM7KVqhSKZi5RXeIPZkZneYqgyxAH_tXVg`;

const get = async (url, options) => {
  if (!!instance) {
    const result = await instance.get(url, options)
      .then(res => res.data.result)
      .catch(e => {
        // console.log(Object.keys(e.request.res.responseUrl))
        // console.logFile(e.request.res.responseUrl)

        return Promise.reject(e)
      })

    return result;
  }
  return null;
}

var fs = require('fs');
var util = require('util');
var log_file = fs.createWriteStream(__dirname + '/debug.log', {flags : 'w'});
var log_stdout = process.stdout;

console.logFile = (d) => { //
  log_file.write(util.format(d) + '\n');
  // log_stdout.write(util.format(d) + '\n');
};

const getSessionToken = async () => {
  const answers = await inquirer.prompt([
    {
      type: "input",
      message: "Source Token: ", 
      name: 'token',
      // validate: (input) => !!input
    }
  ]).catch(error => console.log(error.isTtyError));

  const token = answers && answers.token ? answers.token : defaultToken;
  return token
}

const setAxiosInstance = (token) => {
  if (!instance && !!token) {
    instance = _axios.create({
      baseURL: 'https://api.skedulo.com',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }

  return instance
}

const getListForms = async () => {
  return get("customform/form")
}

const getLinkDownload = async (formRevId) => {
  return get('customform/file/download', {
    params: {
      ['file_name']: 'viewSources.zip',
      ['form_rev_id']: formRevId
    }
  }).catch(e => Promise.resolve(e.request.res.responseUrl))
}

const selectForm = async (forms) => {
  const choices = _.flatten(forms
    .map(form => ({forms: form.formRev.definition.forms.map(item => ({...item, formId: form.id}))}))
    .map(item => item.forms))
    .map(form => `${form.formId}____${form.name}`)
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedForm',
      message: 'Select Forms',
      choices
    }
  ])
  return forms.find(form => form.id === answers.selectedForm.split('____')[0])
}

(async function () {
  // get login token
  const token = await getSessionToken()
  setAxiosInstance(token)
  
  // get all forms
  const forms = await getListForms()

  // selectForm
  const form = await selectForm(forms)
  console.log(form.formRev.id)
  const link = await getLinkDownload(form.formRev.id)
  

  console.log("link ", link)

  // forms.forEach(form => {
  //   echo 
  // });

})()