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

    // IF RUNNING IN PI
    /*const browser = await puppeteer.launch({
        executablePath: '/usr/bin/chromium-browser'
      })*/
    const page = await browser.newPage();

    await page.goto(url, {timeout: 0});

    await page.click('a[href="#nav-yesterday"]');
    await page.waitForSelector('#main_table_countries_yesterday tr[style=""]');

   
    let paises = await page.evaluate(() => {
        
        const elements = document.querySelectorAll('#main_table_countries_yesterday tr[style=""]');

        let countries = "";
        let contador = 1;
        let spain = false;
        let array = []
        for(let element of elements){
            let fila = contador+"- ";
            fila+=element.querySelector('a[href*="country/"]').textContent+": ";
            fila+="Casos: "+element.querySelectorAll('td')[2].textContent+", ";
            fila+="Casos nuevos: "+element.querySelectorAll('td')[3].textContent+"\n";
            array[contador] = fila;
            contador++;
            if(spain){
                break;
            }
            if(element.querySelector('a[href*="country/"]').textContent.includes("Spain")){
                spain = true;
            }
        }
        if(array.length <= 10){
            for(let fila of array){
                countries+=fila;
            }
        }
        else{
            for(let i = 1; i <= 5; i++){
                countries+=array[i];
            }
            countries+=". . . \n"
            for(let i = contador-4; i < contador; i++){
                countries+=array[i];
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



