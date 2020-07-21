'use strict';

const { App } = require('jovo-framework');
const { Alexa } = require('jovo-platform-alexa');
const { GoogleAssistant } = require('jovo-platform-googleassistant');
const { JovoDebugger } = require('jovo-plugin-debugger');
const { FileDb } = require('jovo-db-filedb');
const request = require('request-promise-native');
const { DynamoDb } = require('jovo-db-dynamodb');
var places = [];
// ------------------------------------------------------------------
// APP INITIALIZATION
// ------------------------------------------------------------------

const app = new App();

// Get Google API Key for lambda
const googleAPIkey = "<YOUR API KEY HERE>";

app.use(
    new Alexa(),
    new GoogleAssistant(),
    new JovoDebugger(),
    new DynamoDb(),
    new FileDb()
);

// ------------------------------------------------------------------
// APP LOGIC
// ------------------------------------------------------------------

app.setHandler({

    BusinessHoursIntent() {
        let speech = "We are an 24/7 online service that finds and recommends your local businesses. Say hi to start the process!"
        this.ask(speech);

    },

    BusinessInfoIntent() {
        let speech = "We are an 24/7 online service that finds and recommends your local businesses. Say hi to start the process!"
        this.ask(speech);

    },

    BusinessLocationIntent() {
        let speech = "We are an 24/7 online service that finds and recommends your local businesses. Say hi to start the process!"
        this.ask(speech);

    },

    BusinessServicesIntent() {
        let speech = "We are an 24/7 online service that finds and recommends your local businesses. Say hi to start the process!"
        this.ask(speech);

    },

    'ON_PERMISSION': function() {
        if (this.isGoogleAction())
            if (this.googleAction().isPermissionGranted()) {
                console.log("here")  
                let device = this.googleAction().getDevice();
                this.$user.$data.city = device.location.city
                console.log("#####################################################################")
                console.log(this.$user.$data.city)
                if (typeof this.$user.$data.username === 'undefined') {
                    this.toStateIntent('PermissionState1', "YesIntent");
                }
                else {
                    this.toStateIntent('PermissionState2', "YesIntent");
                }
            } else {
                this.tell('Alright, maybe next time.');
            }
      },


    LAUNCH() {
        if (typeof this.$user.$data.username === 'undefined') {
            let speech ="Welcome to Plaza! \r\n\r\n" +
                "We’ll ask you a few questions to figure out which business is the best match for you. "


            this.$user.$data.city = "";
            this.$user.$data.keyword = "";
            this.$user.$data.hours = "";
            this.$user.$data.hourRange = "";
            this.$user.$data.rating = "";

            // console.log(chalk.blue(this.$dialogflowAgent.setResponseObject(test)));

            // this.followUpState('PermissionState1').ask(speech);
            if (this.isGoogleAction()) {   
                this.googleAction().askForPreciseLocation(speech);
            }
        }
        else {
            let speech ="Welcome back to Plaza, " + this.$user.$data.username + "!"



            this.$user.$data.city = "";
            this.$user.$data.keyword = "";
            this.$user.$data.hours = "";
            this.$user.$data.hourRange = "";
            this.$user.$data.rating = "";

            if (this.isGoogleAction()) {   
                this.googleAction().askForPreciseLocation(speech);
            }
        }

    },

    "PermissionState1" : {
        'YesIntent': function() {
            let speech = "Can you give me pseudonym to call you by?"
            this.followUpState("Information1State").ask(speech);
        }
    },

    "PermissionState2" : {
        YesIntent() {
            let speech = "Ask me something like \'pizza places\' or \'salons\'."
            this.followUpState('GetInfoState').ask(speech);
        },
    },

    'Information1State' : {
        GetInfoIntent() {
                let speech = "I didn't recognize that. " +
                "If you didn't want to give a name, just give me a pseudonym to call you by.";

                this.followUpState('Information1State').ask(speech);

        },

        GetNameIntent() {
            if (typeof this.$user.$data.username === 'undefined')
                this.$user.$data.username = this.$inputs.name.value;
            let speech = "Nice to meet you, " + this.$user.$data.username + ". " +
            "Now ask me something like \'pizza places\' or \'salons\''.";

            this.followUpState('GetInfoState').ask(speech);
        },

        RepeatIntent() {
            let speech = "Could I get a name that you want to use?";

            this.followUpState('Information1State').ask(speech);
        },

        QuitIntent() {
            let speech = "Looking forward to next time."

            this.tell(speech);
        }
    },

    'GetInfoState' : {


      GetInfoIntent() {
          // Parsing parameters
          if (this.$inputs.hours.value) {
              this.$user.$data.hours = this.$inputs.hours.value;
          }
          if (this.$inputs.hourRange.value) {
              this.$user.$data.hourRange = this.$inputs.hourRange.value;
          }
          if (this.$inputs.keyword.value) {
              this.$user.$data.keyword = this.$inputs.keyword.value;
          }
        //   if (this.$inputs.city.value) {
        //       this.$user.$data.city = this.$inputs.city.value;
        //   }

          // routing
          var speech = "Thanks! I still need to ask you a couple more questions to make sure I can get you the right business."
          + " Feel free to \'skip\' or \'quit\' at any question.\r\n\r\n";
          if (this.$user.$data.city == 'undefined') {
              speech += "For me to get your business, I need your city. Could you tell me what city you're in?";
              this.followUpState('LocationState').ask(speech);
          } else if (!this.$inputs.keyword.value) {
              speech += "I wasn't able to verify what type of businesses you wanted. Could you let me know what type of place you're"
              + "looking for? Examples include \'pizza\' or \'haircut\'.";
              this.followUpState('KeywordState').ask(speech);
          } else if (!this.$inputs.hourRange.value && !this.$inputs.hours.value) {
              speech += "What time are you planning to go to this place? Examples include \'9 am\' or \'morning\'.";
              this.followUpState('TimeState').ask(speech);
          } else {
            speech += "Do you have a rating preference? Examples include \'1 star\' or \'3 stars\'." + 
            " If not, say no."
            this.followUpState("LocalBusinessState").ask(speech);
          }
      },

          QuitIntent() {
                  let speech = "Looking forward to next time."

                  this.tell(speech);
          },

          Skipintent() {
                  let speech = "You cannot skip this, please give me some keywrods to work with. Thank you."

                  this.followUpState("GetInfoState").ask(speech);
          }
    },

    'LocationState' : {
        GetInfoIntent() {
          // parsing parameters
          var speech = "Got it! ";

          // routing
          if (this.$user.$data.keyword === "") {
              speech += "Could you let me know what type of place you're"
              + "looking for? Examples include \'pizza\' or \'haircut\'.";
              this.followUpState('KeywordState').ask(speech);
          } else if (this.$user.$data.hourRange === "" && this.$user.$data.hours === "") {
              speech += "What time are you planning to go to this place? Examples include \'9 am\' or \'morning\'.";
              this.followUpState('TimeState').ask(speech);
          } else {
            speech += "Do you have a rating preference? Examples include \'1 star\' or \'3 stars\'."
            this.followUpState("LocalBusinessState").ask(speech);    
          }
      },

        QuitIntent() {
            let speech = "Looking forward to next time."

            this.tell(speech);
        },

    },

    'KeywordState' : {

        GetInfoIntent() {
          this.$user.$data.keyword = this.$inputs.keyword.value;
          var speech = "Sounds good. ";

          // routing
          if (this.$user.$data.hourRange === "" && this.$user.$data.hours === "") {
              speech += "What time are you planning to go to this place? Examples include \'9 am\' or \'morning\'.";
              this.followUpState('TimeState').ask(speech);
          } else {
              speech += "Do you have a rating preference? Examples include \'1 star\' or \'3 stars\'."
              this.followUpState("LocalBusinessState").ask(speech);
          }
        },

        RepeatIntent() {
            let speech = "What kind of business are you looking for? " +
            "Just enter some keywords.";

            this.followUpState('KeywordState').ask(speech);
        },

        QuitIntent() {
            let speech = "Looking forward to next time."

            this.tell(speech);
        },

        NoIntent() {
            let speech = "That's fine too. Feel free to chat again if you're ever trying to find a business.";

            this.tell(speech);
        },

        YesIntent() {
            let speech = "While I appreciate the enthusiasm, I'm looking for some keywords that desribe a business. " +
            "For example, you could say 'hairstylist'."

            this.followUpState('KeywordState').ask(speech);
        },

    },

    'TimeState' : {
        GetInfoIntent() {
            this.$user.$data.hours = this.$inputs.hours.value;
            this.$user.$data.hourRange = this.$inputs.hourRange.value;

            console.log(`(${this.$user.$data.hourRange}) (${this.$user.$data.hours})`);


            let speech = "Great! Last question, I promise. Do you have a rating preference?"

            this.followUpState("LocalBusinessState").ask(speech);
        },

        RepeatIntent() {
            let speech = "What time were you planning on going to the business?"

            this.followUpState('TimeState').ask(speech);
        },

        QuitIntent() {
            let speech = "Looking forward to next time."

            this.tell(speech);
        },

        NoIntent() {
            let speech = "That's fine too. Feel free to chat again if you're ever trying to find a business.";

            this.tell(speech);
        },

        YesIntent() {
            let speech = "Not the sort of answer I was looking for. I was wondering what time you were intending to arrive at the business. " +
            "For example, you could say '11 am'."

            this.followUpState('TimeState').ask(speech);
        },

        SkipIntent() {
            this.$user.$data.hours = NaN;
            this.$user.$data.hourRange = NaN;
            let speech = "Do you have a rating preference?"

            this.followUpState("LocalBusinessState").ask(speech);
        },
    },

    'LocalBusinessState' : {

      async RatingIntent() {
          this.$user.$data.rating = this.$inputs.rating.value;
          console.log(this.$user.$data.rating)
          const place = await getLocalBusiness(this.$user.$data.keyword + " in " + this.$user.$data.city, this.$user.$data.rating);
          let speech = "Excellent. Here is a local businesses you can look into: " + place + "\r\n\r\n"
          + "Would you like to find more businesses?";

          this.followUpState("RestartState").ask(speech);
      },

      async SkipIntent() {
            this.$user.$data.rating = 0;
            console.log(this.$user.$data.rating)
            const place = await getLocalBusiness(this.$user.$data.keyword + " in " + this.$user.$data.city, 0);
            let speech = "Excellent. Here is a local businesses you can look into: " + place + "\r\n\r\n"
            + "Would you like to find more businesses?";

            this.followUpState("RestartState").ask(speech);
      },

      async NoIntent() {
          this.$user.$data.rating = 0;
          console.log(this.$user.$data.rating)
          const place = await getLocalBusiness(this.$user.$data.keyword + " in " + this.$user.$data.city, 0);
          let speech = "Excellent. Here is a local businesses you can look into: " + place + "\r\n\r\n"
          + "Would you like to find more businesses?";

          this.followUpState("RestartState").ask(speech);
      },

      QuitIntent() {
          let speech = "Looking forward to next time."

          this.tell(speech);
      },
  },

  "RestartState" : {
        async YesIntent() {
					const place = await getLocalBusiness(this.$user.$data.keyword + " in " + this.$user.$data.city, this.$user.$data.rating);
					let speech = "Cool. Here's another local businesses you can look into: " + place + "\r\n\r\n"
					+ "Would you like to find more businesses?";

					this.followUpState("RestartState").ask(speech);
        },

        NoIntent() {
            let speech = "Looking forward to next time."

            this.tell(speech);
        }
  }
  });

  // functions for business API
  async function getLocalBusiness(keywords, rating) {
      const query = keywords.replace(' ', '+');
      const apiUri = 'https://maps.googleapis.com/maps/api/place/textsearch/json?' + 'query=' + query + '&key=' + googleAPIkey;
      const options = {
          uri: apiUri,
          json: true
      };
      const place = await request(options);
      // console.log(place);

      var localBusiness = "None found :(";
      for (var i = 0; i < place.results.length; i++) {
          var business = place.results[i];
                  if (business.rating < rating) continue;
									if (places.includes(business.name)) continue;
          if (await isLocal(business.name)) {
						places.push(business.name)
						return business.name + " at " + business.formatted_address;
					}
      }

      return localBusiness;
  }

  async function isLocal(business) {
    const query = business.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").toUpperCase();
    // new vvvvv
    const notLocal = ["PIZZA HUT EXPRESS", "CUT AND ROLL", "DOMINOES", ,"MCDONALDS", "BURGER KING", "MOD PIZZA"];
    if (notLocal.includes(query)) {
        return false;
    }
    // new ^^^^
    var options = {
        'method': 'GET',
        'url': `https://www.amee.com/api/companies?company_name=${query}`,
        'headers': {
          'Authorization': 'Basic YWU3NDZjMzMzZWRlNDVlYTIxZmVhZTYzNDUwYzhkOWY6Y2IxNDgwN2RkY2ZjM2FiMmY5ZGQ4YTZhNjA0YjZkODA='
        }
      };
    const place = await request(options);
    // console.log("Testing " + query);
    const res = JSON.parse(place);
    if (res.companies.length === 0) { return true; }
    else if  (res.companies[0].name.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").startsWith(query))  { return false; }
    return true;
}

  module.exports = { app };