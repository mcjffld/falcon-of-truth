const Alexa = require('alexa-sdk')
const request = require('request')
const async = require('async')
const dateFormat = require('dateformat');
const nodemailer = require('nodemailer');

const testData = {
    request: {
        intent:{
            slots:{
                city: {value: "fairield" },
                checkInDate: {value: "2018-02-02"},
                checkOutDate: {value: "2018-02-10"}
            }
        }
    }
}

function doSearch(event, appCallback) {
    console.log (JSON.stringify(event))
    const cityName = event.request.intent.slots.city.value
    const checkInDate = event.request.intent.slots.checkInDate.value
    const checkOutDate = event.request.intent.slots.checkOutDate.value
    async.waterfall([
        function(callback) {
            const url = 'https://www.priceline.com/svcs/ac/index/hotels/' + encodeURIComponent(cityName) + '/1/0/0/0/'
            console.log (url)
            let cityURL;
            request(url, function (error, response, body) {
                if (!error && response.statusCode !== 200) {
                    error = { message: "Unexpected status code", statusCode: response.statusCode }
                } else {
                    const data = JSON.parse(body)
                    console.log (body)
                    cityURL = "https://www.priceline.com/pws/v0/stay/retail/listing/city-info/" + data.searchItems[0].itemName;     
                }
                callback(error, cityURL);
            });
            
        },
        function(url, callback) {
            console.log(url)
            request(url, function (error, response, body) {
                let stayqlData;
                if (!error && response.statusCode !== 200) {
                    error = { message: "Unexpected status code", statusCode: response.statusCode }
                } else {
                    const data = JSON.parse(body)
                    // &check-in=20180101&check-out=20180102
                    
                    const query = "\nquery getAllListings(\n $adults:       Int,\n $children:     [String],\n $locationID:   ID,\n $locationName: String,\n $latitude:     Float,\n $longitude:    Float,\n $checkIn:      DateString,\n $checkOut:     DateString,\n $roomCount:    Int,\n $cguid:        ID,\n $rguid:        ID,\n $amenities:    [String],\n $allInclusive: Boolean,\n $minPrice:     Float,\n $maxPrice:     Float,\n $sortBy:       HotelSortEnum,\n $currencyCode: HotelCurrencyEnum,\n $pageName:     String,\n $popcountMins: Int,\n $unlockDeals:  Boolean,\n $authToken:    ID,\n $hotelName:    String,\n $first:        Int,\n $offset:       Int,\n $rID:          ID,\n $rateID:       ID,\n $metaID:       String,\n $cityID:       ID,\n $refURL:       String,\n $multiOccDisplay: Boolean,\n $multiOccRates: Boolean,\n $multiOccOptions: String,\n $refClickID:   String,\n $clusters:     [ID],\n $brands:       [ID],\n $dealTypes:    [String],\n $starRatings:  [StarRating],\n $preferredHotels: [ID],\n $productTypes: [HotelProductEnum]) {\n  listings(\n   adults:       $adults,\n   children:     $children,\n   locationID:   $locationID,\n   locationName: $locationName,\n   latitude:     $latitude,\n   longitude:    $longitude,\n   checkIn:      $checkIn,\n   checkOut:     $checkOut,\n   roomCount:    $roomCount,\n   cguid:        $cguid,\n   rguid:        $rguid,\n   minPrice:     $minPrice,\n   maxPrice:     $maxPrice,\n   hotelName:    $hotelName,\n   productTypes: $productTypes,\n   sortBy:       $sortBy,\n   currencyCode: $currencyCode,\n   authToken:    $authToken,\n   amenities:    $amenities,\n   metaID:       $metaID,\n   allInclusive: $allInclusive,\n   pageName:     $pageName,\n   popcountMins: $popcountMins,\n   unlockDeals:  $unlockDeals,\n   rateID:       $rateID,\n   cityID:       $cityID,\n   first:        $first,\n   offset:       $offset,\n   brands:       $brands,\n   clusters:     $clusters,\n   dealTypes:    $dealTypes,\n   preferredHotels: $preferredHotels,\n   rID:          $rID,\n   refURL:       $refURL,\n   refClickID:   $refClickID,\n   multiOccDisplay: $multiOccDisplay\n   multiOccRates:   $multiOccRates\n   multiOccOptions: $multiOccOptions\n   starRatings:     $starRatings) {\n    resultCode\n    resultMessage\n    duration\n    rguid\n    src\n    errorCode\n    offset\n    pageSize\n    totalSize\n    version\n    sortType\n    sopqDisplayFlag\n    opqDisplayFlag\n    recentlyViewedHotelIds\n    signInDealRelatedInfo {\n     promptUserToSignIn\n     numberOfAvailableSignInDeals\n     numberOfDisclosedSignInDeals\n     maxSavingsAmount\n     maxSavingsAmountCurrency\n    }\n    cityInfo {\n      areaId\n      cityId\n      cityName\n      countryCode\n      countryName\n      stateCode\n      stateName\n      lat\n      lon\n      searchedCityId\n      searchedItemName\n      searchedLatitude\n      searchedLocationId\n      searchedLocationType\n      searchedLongitude\n      nearbyCityInfo {\n        areaID\n        areaId\n        cityID\n        cityId\n        cityName\n        countryCode\n        countryName\n        distance\n        gmtTimeZoneOffset\n        gmtTimeZoneOffsetDST\n        latitude\n        longitude\n        hotelCount\n        hotelMarketRank\n        isoCountryCode\n        matchType\n        matchName\n        minStarRating\n        maxStarRating\n        samedayCount\n        stateCode\n        stateName\n        superClusterID\n        superClusterId\n        superClusterIdV2\n      }\n      superClusterInfo{\n        distance\n        keyCityId\n        lat\n        lon\n        shortSuperClusterName\n        superClusterId\n        superClusterName\n        subclusterList{\n          centerLat\n          centerLong\n          description\n          gridRank\n          subclusterId\n          subclusterName\n        }\n      }\n      nearbySuperClusters{\n       superClusterId\n       superClusterName\n       shortSuperClusterName\n       lat\n       lon\n       keyCityId\n       distance\n      }\n      zonePolygonInfo\n    }\n    tripFilterSummary {\n      totalSizeFiltered\n      clusterCounts\n      dealTypeCounts\n      amenityCounts\n      brandIdCounts\n      cityCounts\n      starRatingCounts\n      propertyType {\n       count\n       typeId\n       typeTitle\n      }\n      propertyTypeCounts\n      minFilterPrice\n      maxFilterPrice\n      maxFilterPricePerStay\n    }\n    possibleMatches {\n      areaID\n      areaId\n      cityID\n      cityId\n      cityName\n      countryCode\n      countryName\n      gmtTimeZoneOffset\n      gmtTimeZoneOffsetDST\n      isoCountryCode\n      latitude\n      longitude\n      stateCode\n      stateName\n      superClusterID\n      superClusterId\n    }\n    hotels {\n      allInclusiveRateProperty\n      bedChoiceAvailable\n      brandId\n      chainCode\n      channelName\n      cugUnlockDeal\n      dealScore\n      dealTypes\n      dealUnwrapable\n      description\n      displayRank\n      hotelId\n      pclnId\n      hotelType\n      htlDealScore\n      maxChildrenStayFreeAge\n      maxChildrenStayFreeNum\n      metaId\n      name\n      hotelVirtualTourURL\n      guestReviewGdsName\n      overallGuestRating\n      partialUnlock\n      programCategoryName\n      childrenStayFree\n      signInDealsAvailable\n      popularityCount\n      programCode\n      programMessage\n      programCategoryName\n      programDisplayType\n      programName\n      propertyTypeId\n      proximity\n      recentlyViewed\n      retailEnabledFlag\n      recmdScore\n      starRating\n      thumbnailUrl\n      totalReviewCount\n   \t\tlocation {\n        address {\n          addressLine1\n          cityName\n          countryName\n          isoCountryCode\n          phone\n          provinceCode\n          zip\n        }\n        cityId\n        countryName\n        countryCode\n        encLatLong\n        latitude\n        longitude\n        neighborhoodId\n        neighborhoodName\n        timeZone\n        zoneId\n        zoneName\n        zoneType\n      }\n      policies {\n        checkInTime\n        checkOutTime\n        importantInfo\n      }\n      hotelFeatures {\n        features\n        highlightedAmenities\n        topAmenities\n        semiOpaqueAmenities\n        hotelAmenities{\n          code\n          displayable\n          filterable\n          free\n          name\n          type\n        }\n      }\n      hotelViewCount {\n       elapsedTimeInMinutes\n       cumulativeViewCount\n      }\n      metaSearch{\n        priceChangeCode\n        pclnPrice\n        clickedPrice\n        currency\n      }\n      ratesSummary {\n        channelName\n        programName\n        merchandisingFlag\n        minPrice\n        minStrikePrice\n        minCurrencyCode\n        minCurrencyCodeSymbol\n        minRateSavingsPercentage\n        freeCancelableRateAvail\n        payWhenYouStayAvailable\n        showRecommendation\n        ccNotRequiredAvailable\n        programCategoryName\n        rateAccessCode\n        applePayRateAvailable\n        showRecommendation\n        savingsClaimStrikePrice\n        savingsClaimPercentage\n        savingsClaimDisclaimer\n        ccNotRequiredAvailable\n        applePayRateAvailable\n        pricedOccupancy\n        gid\n        rateCategoryCode\n        rateCategoryType\n        optDbgInfo\n        rateTypeCode\n        roomCode\n        roomName\n        showRecommendation\n        strikePricePerStay\n        suggestedNumOfRooms\n        planCode\n        rateIdentifier\n        roomLeft\n        pclnId\n        preferredRateId\n        savingsPct\n        merchandisingId\n        status\n        additionalRatesInfo {\n          agencyEnabledForProp\n          gid\n          merchantEnabledForProp\n          rateIdentifier\n          rateTypeCode\n        }\n        minRatePromos {\n         desc\n         terms\n         type\n         title\n         valueAddDesc\n         discountType\n         discountPercentage\n         displayStrikethroughPrice\n         displayStrikethroughPriceCurrency\n         nativeStrikethroughPrice\n         nativeStrikethroughPriceCurrency\n         showDiscount\n         dealType\n         freeNightCumulative\n         numNightsPerFreeNight\n         numFreeNightsGiven\n        }\n        availablePromos {\n         desc\n         terms\n         type\n         title\n         valueAddDesc\n         discountType\n         discountPercentage\n         displayStrikethroughPrice\n         displayStrikethroughPriceCurrency\n         nativeStrikethroughPrice\n         nativeStrikethroughPriceCurrency\n         showDiscount\n         dealType\n         freeNightCumulative\n         freeNightDailyRateDisplay\n         numNightsPerFreeNight\n         numFreeNightsGiven\n        }\n      }\n    }\n  }\n}\n "
                    
                    const variables = {
                        "locationID": data.cityId,
                        "checkIn": checkInDate.replace(/-/g,""),
                        "checkOut": checkOutDate.replace(/-/g,""),
                        "currencyCode": "USD",
                        "roomCount": 1,
                        "first": 1,
                        "productTypes": [
                            "RTL"
                        ]
                    }
                    
                    console.log (variables)
                    stayqlData = {
                        "operation": null,
                        "query": query,
                        variables: variables
                    }
                }
                callback(error, stayqlData);
            });
        },
        function(stayqlData, callback) {
            const url = "https://www.priceline.com/stay/search/stayql"
            console.log ("search URL: ", url)
            //console.log (JSON.stringify(stayqlData))
            request.post({
                url: url,
                headers: {'content-type' : 'application/json'},
                body: JSON.stringify(stayqlData)
            }, function (error, response, body) {
                let data;
                if (!error && response.statusCode !== 200) {
                    error = { message: "Unexpected status code", statusCode: response.statusCode }
                } else {
                    data = JSON.parse(body)
                }
                callback(error, data.data);
            });
        },
        function(data, callback) {
            console.log (data.listings)
            const hotel = data.listings.hotels[0]
            const url = "https://www.priceline.com/pws/v0/stay/integratedlisting/detail/" + hotel.hotelId
            
            console.log (url)
            request(url, function(error, response, body) {
                let imageData;
                if (error) {
                    console.log (error)
                } else if (response.statusCode != 200) {
                    error = { message: "Unexpected status code", statusCode: response.statusCode }
                } else {
                    console.log (body)
                    const hotelData = JSON.parse(body)
                    imageData = hotelData.hotel.images[0]
                }
                callback(error, hotel, imageData)
            });
            
        },
        function(hotel, imageData, callback) {
            
            if (!event.session) {
                callback(null, hotel, imageData, {})
            } else {
                var amznProfileURL = 'https://api.amazon.com/user/profile?access_token=';
                
                amznProfileURL += event.session.user.accessToken;
                
                request(amznProfileURL, function(error, response, body) {
                    let profile
                    if (error) {
                        console.log (error)
                    } else if(response.statusCode != 200) {
                        error = { message: "Unexpected status code", statusCode: response.statusCode }
                    } else {
                        profile = JSON.parse(body);
                    }
                    callback(error, hotel, imageData, profile)
                });
            }
        }
    ], function (err, hotel, imageData, profile) {
        appCallback(err, hotel, imageData, profile)
    });
}
const handlers = {
    'LaunchRequest': function () {
        console.log ('LaunchRequest started')
        if (! this.event.session.user.accessToken) {
            alexa.emit(':tellWithLinkAccountCard', 'to start using this skill, please use the companion app to authenticate on Amazon')
        }
        console.log ('LaunchRequest completed')
	},
    
	'HelloWorldIntent': function () {
        console.log ('HelloWorldIntent started')
        this.emit(':tell', 'Hello Falcon of Truth!');
        this.emit('FindHotelIntent');
        console.log ('HelloWorldIntent completed')
    },
    
    'FindHotelIntent': function () {
        console.log ('FindHotelIntent started')
        console.log (this.event.request.dialogState)
        console.log (this.event.session.user)
        const xx = this
        if (this.event.request.dialogState !== 'COMPLETED'){
            this.emit(':delegate');
        } else {
            const session = this.event.session
            
            console.log (session);
            
            if (session) {
                const user = session.user
                
                console.log (user);
            }
            
            doSearch(this.event, function(error, hotel, imageData, profile) {
                console.log ('doSearch started')
                if (error) {
                    console.log (error);
                    xx.emit(':tell', 'Sorry, had a problem getting a hotel');
                } else {
                    console.log (hotel)
                    console.log (profile)
                    const smallImageUrl = imageData.imageUrl.replace('http://','https://')
                    const largeImageUrl = imageData.imageHDUrl ? imageData.imageHDUrl.replace('http://','https://') : smallImageUrl
                    const imageObj = {
                        largeImageUrl: largeImageUrl,
                        smallImageUrl: smallImageUrl
                    }
                    
                    console.log (imageObj)
                    
                    const checkInDate = xx.event.request.intent.slots.checkInDate.value
                    const checkOutDate = xx.event.request.intent.slots.checkOutDate.value
                    
                    const answerText = 'How about ' + hotel.name + ' for ' + hotel.ratesSummary.minCurrencyCodeSymbol +  hotel.ratesSummary.minPrice +
                    ' per night with check in on ' + dateFormat(new Date(checkInDate), "dddd, mmmm dS, yyyy") + ' and check out on ' + dateFormat(new Date(checkOutDate), "dddd, mmmm dS, yyyy")
                    
                    const plURL = 'https://www.priceline.com/stay/search/details/' + hotel.hotelId  + '/' + checkInDate + '/' + checkOutDate
                    
                    xx.emit(':tellWithCard', answerText, "Your Trip to " + xx.event.request.intent.slots.city.value, answerText + '\n\n\n\n' + plURL, imageObj);
                    
                    console.log ('doSearch completed')
                    
                    const smtpConfig = {
                        host: 'email-smtp.us-east-1.amazonaws.com',
                        port: 587,
                        secure: false, // upgrade later with STARTTLS
                        auth: {
                            user: 'AKIAJJNA6NDJHRANN3TQ',
                            pass: 'AgDoS38dvA2qTR+ZHOYTPzZZoiBHFeEAWnFC/Z2gxgFH'
                        }
                    };
                    
                    const transporter = nodemailer.createTransport(smtpConfig)
                    
                    const message = {
                        from: 'mcjffld@gmail.com',
                        to: profile.email,
                        subject: "Your Trip to " + xx.event.request.intent.slots.city.value,
                        text: answerText + '\n\n\n' + plURL,
                        html: answerText + '<p><p><p><p><a href="' + plURL + '">' + plURL
                    };
                    
                    console.log (message)
                    
                    transporter.sendMail(message, function(error, info) {
                        console.log (error)
                        console.log (info)
                    })
                    
                    
                    
                }
            })       
        }
        console.log ('FindHotelIntent completed')
    },
    'SessionEndedRequest': function() {
        console.log ('session ended')
        this.emit(':tell', 'Have a great trip');
    },
    'Unhandled': function () {
        this.emit(':ask', HelpMessage, HelpMessage);
    },
}

exports.handler = function(event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.appId = 'amzn1.ask.skill.fb43acb1-dd6f-48fc-9342-3825c7106966'
    alexa.registerHandlers(handlers);
    alexa.execute();
};