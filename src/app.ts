import { Builder, By } from 'selenium-webdriver';
import * as Chrome from 'selenium-webdriver/chrome';
import * as fs from 'fs';

import { list } from './data/list';
import { convertFormattedNumber } from './format-number';
import { saveInstagramData, deleteProfiles, deleteReels } from './airtable-api';

(async (): Promise<void> => {
  const options = new Chrome.Options();
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--disable-gpu');
  options.addArguments('--disable-extensions');
  options.addArguments('--disable-infobars');
  options.addArguments('--disable-popup-blocking');
  options.addArguments('--start-maximized');
  options.addArguments('--remote-debugging-port=9222');


  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  try {
    await driver.get('https://instagram.com');
    await driver.sleep(5000);

    const email = driver.findElement(By.css('[name="username"]'));
    const password = driver.findElement(By.css('[name="password"]'));
    const submit = driver.findElement(By.css('[type="submit"]'));
    await email.sendKeys('your instagram login'); // change credentials
    await password.sendKeys('your password'); // change credentials
    await submit.click();
    await driver.sleep(20000);
  } catch (error: any) {
    console.error(error);
  }

  try {
    const profiles = [];

    for (let i = 0; i < list.length; i++) {
      const url = list[i];
      try {
        await deleteProfiles();
        await deleteReels();

        await driver.get(url);
        await driver.sleep(10000);

        const links = await driver.findElements(By.css('[role="link"]'));
        await driver.sleep(5000);

        const user = await driver.findElement(By.css('[href="#"]'));
        const username = await user.getText();

        const followersField = await driver.findElement(
          By.css(`[href="/${username}/followers/`)
        ).findElement(By.css('span')).getAttribute('title');

        const followers = await convertFormattedNumber(followersField);

        if (Number(followers) < 20000) {
          continue;
        }

        const profile = {
          username,
          followers,
          reels: []
        };

        for (let k = 0; k < links.length; k++) {
          const element = links[k];
          const link = await element.getAttribute('href');

          if (link) {
            const type = link.split('/');
            if (type[4] === 'reel') {
              const div = await element.findElements(By.css('div'));
              const viewsElement = await div[3].getText();
              const views = await convertFormattedNumber(viewsElement);
              profile.reels.push({ link, views });
            }
          }
        }
        await saveInstagramData(profile);
        profiles.push(profile);
        driver.sleep(5000);
      } catch (error: any) {
        console.error(error)
        continue;
      }
    }
    
    fs.writeFileSync('./data/data.json', JSON.stringify(profiles, null, 2));

    console.log('Scrap success!');
  } catch (error: any) {
    console.error(error);
  } finally {
    await driver.close();
  }
})();
