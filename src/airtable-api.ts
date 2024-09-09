import axios from 'axios';

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const BASE_ID = process.env.BASE_ID;
const PROFILE_ID = process.env.PROFILE_ID;
const REELS_ID = process.env.REELS_ID;

export const saveInstagramData = async (data: any): Promise<void> => {
  try {
    const { username, followers, reels } = data;

    const profileResponse = await axios.post(
      `https://api.airtable.com/v0/${BASE_ID}/${PROFILE_ID}`,
      {
        fields: {
          Name: username,
          Followers: followers,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    const profileId = profileResponse.data.id;

    for (let i = 0; i < reels.length; i++) {
      const element = reels[i];
      const reel = await axios.post(
        `https://api.airtable.com/v0/${BASE_ID}/${REELS_ID}`,
        {
          fields: {
            Link: element.link,
            Views: element.views,
            Profiles: [profileId]
          },
        },
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    console.log(`Successfully saved data for ${username}`);
  } catch (error: any) {
    console.error(error);
  }
};

export const deleteProfiles = async (): Promise<void> => {
  const profileResponse = await axios.get(
    `https://api.airtable.com/v0/${BASE_ID}/${PROFILE_ID}`,
    {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const records = profileResponse.data.records;

  if (records.length === 0) {
    return;
  }

  while (records.length > 0) {
    const batch = records.splice(0, 10);
    const deletePromises = batch.map((record: any) => {
      return axios.delete(
        `https://api.airtable.com/v0/${BASE_ID}/${PROFILE_ID}`,
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );
    });
    await Promise.all(deletePromises);
    console.log('Deleted all profiles');
  }
};

export const deleteReels = async (): Promise<void> => {
  const reels = await axios.get(
    `https://api.airtable.com/v0/${BASE_ID}/${REELS_ID}`,
    {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const records = reels.data.records;

  if (records.length === 0) {
    return;
  }

  while (records.length > 0) {
    const batch = records.splice(0, 10);
    const deletePromises = batch.map((record: any) => {
      return axios.delete(
        `https://api.airtable.com/v0/${BASE_ID}/${REELS_ID}`,
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );
    });
    await Promise.all(deletePromises);
    console.log('Deleted all reels');
  }
};
