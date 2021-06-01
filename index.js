const puppeteer = require('puppeteer');
const fs = require ('fs');

var url = 'https://www.worldometers.info/coronavirus/#countries';

let today = new Date();
let day = String(today.getDate()).padStart(2, '0');
let month = String(today.getMonth() + 1).padStart(2, '0');
let year = today.getFullYear();

fs.writeFile("covid"+day+""+month+""+year+".txt","", function(err){
    if(err) throw err;
    console.log("File is created succesfully.");
});

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(url, {timeout: 0});

    await page.click('a[href="#nav-yesterday"]');
    await page.waitForSelector('#main_table_countries_yesterday tr[style=""]');


    let paises = await page.evaluate(() => {
        
        const elements = document.querySelectorAll('#main_table_countries_yesterday tr[style=""]');

        let countries = "";
        let contador = 1;
        for(let element of elements){
            let fila = contador+"- ";
            fila+=element.querySelector('a[href*="country/"]').textContent+": ";
            fila+="Casos: "+element.querySelectorAll('td')[2].textContent+", ";
            fila+="Casos nuevos: "+element.querySelectorAll('td')[3].textContent+"\n";
            countries+=fila;
            contador++;
            if(contador>10){
                break;
            }
        }
        return countries;
    });

    fs.appendFile("covid"+day+""+month+""+year+".txt", paises , function (err) {
        if (err) throw err;
        console.log('Saved!');
      });

    console.log(paises);

    await browser.close();

    await process.exit();
})()

