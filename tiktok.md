# Process for getting popular posts from user account on tiktok

- To get User Popular posts, we first must obtain the secUid first from this endpoint:

Endpoint:

const url = 'https://tiktok-api23.p.rapidapi.com/api/user/info?uniqueId=taylorswift';
const options = {
	method: 'GET',
	headers: {
		'x-rapidapi-key': '05190f78f6msh18b5c339652b410p105a0ejsn01a80d032b0b',
		'x-rapidapi-host': 'tiktok-api23.p.rapidapi.com'
	}
};

try {
	const response = await fetch(url, options);
	const result = await response.text();
	console.log(result);
} catch (error) {
	console.error(error);
}

This will return results as following:


{
  "extra": {
    "fatal_item_ids": [],
    "logid": "20250327063023CDB58E46315A977B985B",
    "now": 1743028223000
  },
  "log_pb": {
    "impr_id": "20250327063023CDB58E46315A977B985B"
  },
  "shareMeta": {
    "desc": "@taylorswift 32.6m Followers, 0 Following, 248.4m Likes - Watch awesome short videos created by Taylor Swift",
    "title": "Taylor Swift on TikTok"
  },
  "statusCode": 0,
  "status_code": 0,
  "status_msg": "",
  "userInfo": {
    "stats": {
      "diggCount": 2204,
      "followerCount": 32600000,
      "followingCount": 0,
      "friendCount": 0,
      "heart": 248400000,
      "heartCount": 248400000,
      "videoCount": 71
    },
    "user": {
      "avatarLarger": "https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/f8c7cad75f3a12205d31d6662d2555d5~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=44dee363&x-expires=1743199200&x-signature=%2BGEGvUBERYBrAM3WxRM7lBR%2BwHk%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=my",
      "avatarMedium": "https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/f8c7cad75f3a12205d31d6662d2555d5~tplv-tiktokx-cropcenter:720:720.jpeg?dr=14579&refresh_token=9014dbf4&x-expires=1743199200&x-signature=z0YrUAc7zL43tXzRLreiqXkp3UQ%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=f20df69d&idc=my",
      "avatarThumb": "https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/f8c7cad75f3a12205d31d6662d2555d5~tplv-tiktokx-cropcenter:100:100.jpeg?dr=14579&refresh_token=5e79e1f7&x-expires=1743199200&x-signature=JC18MQX811ztSmm8YN5MdLNjViA%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=f20df69d&idc=my",
      "bioLink": {
        "link": "taylorswift.com",
        "risk": 0
      },
      "canExpPlaylist": true,
      "commentSetting": 0,
      "commerceUserInfo": {
        "commerceUser": false
      },
      "downloadSetting": 0,
      "duetSetting": 0,
      "followingVisibility": 1,
      "ftc": false,
      "id": "6881290705605477381",
      "isADVirtual": false,
      "isEmbedBanned": false,
      "nickNameModifyTime": 1629723423,
      "nickname": "Taylor Swift",
      "openFavorite": true,
      "privateAccount": false,
      "profileEmbedPermission": 1,
      "profileTab": {
        "showMusicTab": true,
        "showPlayListTab": false
      },
      "relation": 0,
      "secUid": "MS4wLjABAAAAqB08cUbXaDWqbD6MCga2RbGTuhfO2EsHayBYx08NDrN7IE3jQuRDNNN6YwyfH6_6",
      "secret": false,
      "signature": "This is pretty much just a cat account",
      "stitchSetting": 0,
      "ttSeller": false,
      "uniqueId": "taylorswift",
      "verified": true
    }
  }
}

The secUid then must be extracted, then utilized for the next endpoint:

const url = 'https://tiktok-api23.p.rapidapi.com/api/user/popular-posts?secUid=MS4wLjABAAAAqB08cUbXaDWqbD6MCga2RbGTuhfO2EsHayBYx08NDrN7IE3jQuRDNNN6YwyfH6_6&count=35&cursor=0';
const options = {
	method: 'GET',
	headers: {
		'x-rapidapi-key': '05190f78f6msh18b5c339652b410p105a0ejsn01a80d032b0b',
		'x-rapidapi-host': 'tiktok-api23.p.rapidapi.com'
	}
};

try {
	const response = await fetch(url, options);
	const result = await response.text();
	console.log(result);
} catch (error) {
	console.error(error);
}

Within the const url, this is where the secUid must be placed (from the first endpoint), then placed into the second endpoint.

The flow:

User types in username of the person they want to extract popular posts from > endpoint 1 runs > extract secUid > place into endpoint 2 > display results.