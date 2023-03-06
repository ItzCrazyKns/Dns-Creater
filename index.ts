import express, { Request, Response} from 'express';
import * as config from './config.json';

let app = express()

app.set('view engine', 'ejs')

app.get('/', async (req,res) => {
    res.render('index')
})

app.get('/create', async (req, res) => {
    try {
        let found = false

        await fetch('https://api.cloudflare.com/client/v4/zones/' + config.zoneid + '/dns_records', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + config.apikey,
    'Content-Type': 'application/json'
  },
})
  .then(response => response.json())
  .then(json => {
    for (let i = 0; i < json.result.length; i++) {
      if (json.result[i].name == req.query.name + '.' + config.domain) {
        res.send('{ "exists": true }')
        found = true
        break;
      }
    }
  })
  .catch(error => {
    console.log(error)
  });
  if(found == false) {
    await fetch('https://api.cloudflare.com/client/v4/zones/' + config.zoneid + '/dns_records', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + config.apikey,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    type: 'A',
    name: req.query.name + '.' + config.domain,
    content: req.query.ip,
    ttl: 1,
    priority: 10,
    proxied: false
  })
})
.then(response => {
  if(response.status == 200) {
    res.send(`${response.status} Successfuly Created Subdomain For ${req.query.name}.${config.domain} That Points To ${req.query.ip}`)
  } else if(response.status >= 400 && response.status <= 499) {
    res.send('An Error Has Occured')
  } else {
    res.send('Invalid Response')
  }
}) 
}
    } catch(err) {
        console.log(err)
    }
})

app.listen(80, () => {
    console.log("Server Started On Port 80")
})


