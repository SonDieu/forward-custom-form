const inquirer = require("inquirer") // https://github.com/SBoudrias/Inquirer.js#question
const _axios = require("axios")
const _ = require("lodash")
const path = require('path') 
const fs = require('fs');
const util = require('util');
let instance = null;

const defaultToken = `eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlEwWXdOekF5UTBFME1UTXdRa05FTWpWQ05rRTVSRFUxTURoRk16TXhNa1kyTVRFelFVSkJRUSJ9.eyJodHRwczovL2FwaS5za2VkdWxvLmNvbS91c2VyX2lkIjoic2FsZXNmb3JjZS1zYW5kYm94fDAwNTZGMDAwMDA2dzFPRFFBWSIsImh0dHBzOi8vYXBpLnNrZWR1bG8uY29tL3ZlbmRvciI6InNhbGVzZm9yY2UiLCJodHRwczovL2FwaS5za2VkdWxvLmNvbS91c2VybmFtZSI6ImViYWNraG91c2VAaW5jbHVzaW9uLmNvbS5mdWxsc2IiLCJodHRwczovL2FwaS5za2VkdWxvLmNvbS9vcmdhbml6YXRpb25faWQiOiIwMEQ5RDAwMDAwMDhhUnRVQUkiLCJodHRwczovL2FwaS5za2VkdWxvLmNvbS9uYW1lIjoiU2tlZHVsbyBBZG1pbiIsImh0dHBzOi8vYXBpLnNrZWR1bG8uY29tL3NmX2VudiI6InNhbGVzZm9yY2Utc2FuZGJveCIsImh0dHBzOi8vYXBpLnNrZWR1bG8uY29tL3Jlc291cmNlX2lkIjoiYTJWNkYwMDAwMDFGVzY0VUFHIiwiaHR0cHM6Ly9hcGkuc2tlZHVsby5jb20vcm9sZXMiOlsic2NoZWR1bGVyIiwicmVzb3VyY2UiLCJhZG1pbmlzdHJhdG9yIl0sImh0dHBzOi8vYXBpLnNrZWR1bG8uY29tL3ZlbiI6eyJjb21tdW5pdHlfaWQiOm51bGwsInVzZXJfaWQiOiIwMDU2RjAwMDAwNncxT0RRQVkifSwiaXNzIjoiaHR0cHM6Ly9za2VkdWxvLmF1dGgwLmNvbS8iLCJzdWIiOiJzYWxlc2ZvcmNlLXNhbmRib3h8MDA1NkYwMDAwMDZ3MU9EUUFZIiwiYXVkIjpbImh0dHBzOi8vYXBpLnNrZWR1bG8uY29tIiwiaHR0cHM6Ly9za2VkdWxvLmF1dGgwLmNvbS91c2VyaW5mbyJdLCJpYXQiOjE1ODQ2MDYzODUsImV4cCI6MTU4NDY0OTU4NSwiYXpwIjoiOW1FSkMwcUtFWkluVGE4TzJ1UzMwbWR3TFV5ajZZckgiLCJzY29wZSI6Im9wZW5pZCJ9.d-eDEaeimhQbbd7-AH0bJGvwer8NjK8IOuAWtZ8Mt38jNSo0hImPlcdj_8MCKpPWWRwNDj__SKFjav051wnzptgYaKdr4NO0vJaO7sxx3cOxQO7SBIKOJt3UeM51PzkOEOEIwikQTnQJWScay7qqREYgQVvpa-5kCCvuLKjB5UAEDjooIvJP2FsdLSx9NeRkh8ao5TssCFzbVpWX3snEssWOwn4yYoRKl3MAXO3nEPaVktP0ZaJOvTCfj71YcGvFz0L933w21X9oe3HiapWWmu2LeHIz3370cG_YN-OBylmeub4wQDQ2d6tdzez6HtHiwlhVQWAbK3cuSqJgA-xVqg`;

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

const downloadSourceFile = async (url) => {  
  const _path = path.resolve(__dirname, 'download', 'viewSources.zip')
  const writer = fs.createWriteStream(_path)

  const response = await _axios({
    url,
    method: 'GET',
    responseType: 'stream'
  }).catch(e => {
    console.log("Download Error")
    return Promise.reject(e)
  })

  response.data.pipe(writer)

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve)
    writer.on('error', reject)
  })
}

const selectForm = async (forms) => {
  const choices = _.flatten(forms
    .map(form => ({forms: form.formRev.definition.forms.map(item => ({...item, formId: form.id, jobTypes: form.jobTypes}))}))
    .map(item => item.forms))
    .map(form => `${form.formId}____${form.name}${form.jobTypes.length > 0 ? (' [' + form.jobTypes.join(`, `) + ']') : ''}`)
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
  const link = await getLinkDownload(form.formRev.id)
  
  await downloadSourceFile(link)
    .catch(e => console.logFile(e))
    .then(() => console.log("Download done"))

  

  // forms.forEach(form => {
  //   echo 
  // });

})()