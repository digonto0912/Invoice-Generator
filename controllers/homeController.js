const fs = require('fs');
const path = require('path');
const data = require('../helpers/data');

// updated
const hbs = require('handlebars');
const puppeteer = require('puppeteer');


const compile = async function (templateName, data) {
    const filePath = path.join(__dirname, `../views/` + `${templateName}.hbs`);

    const html = await fs.promises.readFile(filePath, 'utf-8');

    const template = hbs.compile(html)
    return template(data);
};

hbs.registerHelper('dateFormat', function (value, format) {
    return moment(value).format(format);
});

const getAllData = () => {

    let array = [];

    console.log(data);
    

    data.products.forEach(d => {
        const prod = {
            name: d.name,
            description: d.description,
            unit: d.unit,
            quantity: d.quantity,
            price: d.price,
            total: d.quantity * d.price,
            imgurl: d.imgurl
        }
        array.push(prod);
    });

    let subtotal = 0;
    array.forEach(i => {
        subtotal += i.total
    });
    const tax = (subtotal * 20) / 100;
    const grandtotal = subtotal - tax;

    const CompleteData = {
        prodlist: array,
        subtotal: subtotal,
        tax: tax,
        gtotal: grandtotal,
        head_comment: data.head_comment
    }
    
    return CompleteData;
}

// Main Part
(async function () {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        const data = getAllData();
        const content = await compile('template', data);
        const filename = Math.random() + '_doc' + '.pdf';

        await page.setContent(content);
        await page.emulateMediaType('screen');
        await page.pdf({
            path: `docs/${filename}`,
            format: 'A4',
            printBackground: true
        });

        console.log("done");

        await browser.close();
        process.exit();
    } catch (error) {
        console.error(error);
    }
})();