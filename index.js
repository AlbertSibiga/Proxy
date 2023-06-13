const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const FormData = require("form-data");
const cors = require("cors");
const app = express();
const port = 5000;

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.static('build'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => res.json("SERVER is WORKING"));

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
function isValidIP(str) {
  const octet = '(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]?|0)';
  const regex = new RegExp(`^${octet}\\.${octet}\\.${octet}\\.${octet}$`);
  return regex.test(str);
}


const IpRisk = async (ip) => {
  if (!isValidIP(ip)) {
    return { 'ip': ip, 'risk': 'risk', 'score': 'score', 'details': 'Fail! Please Confirm Proxy Addr, Name and Pass.' };
  }
  const endpoint = `https://scamalytics.com/ip/${ip}`;
  const response = await axios.get(endpoint);
  const html = response.data;
  const $ = cheerio.load(html);
  const risk = $(".panel_title.high_risk").text();
  const score = $(".score").text();
  const details = $(".panel_body").text().replace("Scamalytics", "We").trim();

  return { ip, risk, score, details };
};

const Location = async (ip) => {
  if (!isValidIP(ip)) {
    return { 'IPdetails': 'Fail! Please Confirm Proxy Addr, Name and Pass.' };
  }
  await sleep(2000);
  const endpoint = `https://ipwhois.app/json/${ip}`;
  try {
    const response = await axios.get(endpoint);
    if (!response.data) {
      return await Location(ip);
    }
    return response.data;
  } catch (error) {
    console.log('Location error');
    return await Location(ip);
  }

};

const IpState = async (proxy) => {
  await sleep(2000);
  const endpoint = `https://api.proxy-checker.net/api/proxy-checker/`;
  const formData = new FormData();
  formData.append("proxy_list", proxy);
  try {
    const response = await axios.post(endpoint, formData, {
      headers: formData.getHeaders(),
    });
    if (!response.data[0]) {
      return await IpState(proxy);
    }
    return response.data[0];
  } catch (error) {
    if(isValidIP(proxy)){
      return await IpState(proxy);
    }else{
      return proxy;
    }
  }
};

const apiKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NDg2MWI5NTFlMWFkNDMzMWQwYTljMmQiLCJ0eXBlIjoiZGV2Iiwiand0aWQiOiI2NDg2MjM1NmZiYTU2ZTMyOWQxZTIyYTcifQ.03cADWZjonvQDQP4hmqX5rThDXIUb4C-x473LYtjqmM";

const ipCrack = async (proxy, cnt = 1) => {
  const [host, port, username, password] = proxy.split(":");
  if(isValidIP(host)){
    return host;
  } 
  const type = "http";
  await sleep(2000);
  /*const endpoint = `https://api.gologin.com/browser/check_proxy`;
  try {
    const response = await axios.post(
      endpoint,
      {
        type,
        host,
        port,
        username,
        password,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    console.log(response.data.status + ':::' + host);
    if (response.data.status == "success") {
      return response.data.origin;
    } else if (response.data.status == "fail") {
      return host;
    } else {
      return host;//'Fail'
    }
  } catch (error) {
    if(!isValidIP(host) && port && username && password && cnt < 10){
      return await ipCrack(proxy, cnt+1);
    }else{
      return host;
    }
  }*/

  const endpoint = 'https://www.courier.com/api/tools/domain-ip-lookup/?domain=' + host;
  try {
    const response = await axios.get(endpoint);
    if (!response.data) {
      return await ipCrack(proxy);
    }
    return response.data.result[response.data.result.length - 1];
  } catch (error) {
    if(!isValidIP(host) && cnt < 10){
      return await ipCrack(proxy, cnt+1);
    }else{
      return host;
    }
  }/**/

};

const proxyCrack = async (proxy) => {
  const real_host = await ipCrack(proxy);
  const [host, port, username, password] = proxy.split(":");
  const type = "http";
  if (username && password) {
    return real_host + ":" + port + ":" + username + ":" + password;
  } else {
    return real_host + ":" + port;
  }
};

app.get("/", (req, res) => res.json("SERVER is WORKING"));

app.post("/check-ip", async (req, res) => {
  const proxyArr = await Promise.all(req.body.ip.split("\n"));
  console.log("proxyArr:::", proxyArr)////
  const ipArr = await Promise.all(proxyArr.map((proxy) => ipCrack(proxy)));
  console.log("ipArr:::", ipArr)
  /*const res_proxyArr = await Promise.all(
    proxyArr.map((proxy) => {
      let p1 = proxyCrack(proxy)
      return p1 === proxy ? null : p1
    })
  );*/
  //console.log("res_proxyArr:::", res_proxyArr)
  const res_IpRisk = await Promise.all(ipArr.map((ip) => IpRisk(ip)));
  const res_location = await Promise.all(ipArr.map((ip) => Location(ip)));
  // console.log(res_IpRisk);
  // console.log(res_location);
  /*const res_state = await Promise.all(
    res_proxyArr.map((proxy) => {
      //console.log(proxy);
      if (proxy === null) {
        return { flag: 'Fail' }
      } else {
        return IpState(proxy);
      }
      proxy === null ? {flag : 'Fail'} : IpState(proxy); 
    })
  );*/
  const ProxyPort = proxyArr.map((proxy) => {
    return { 'port': proxy.split(':')[1] };
  })
  res.json({
    risk: res_IpRisk,
    location: res_location,
    state: ProxyPort,
  });/**/
  return;
});

app.listen(port, () => {
  console.log(`IP Checker app listening at http://localhost:${port}`);
});
 
module.exports = app;