/**
 * Created with Intellij IDEA.
 * User: xmapact
 * Date: 12/1/13
 * Time: 4:22 PM
 */

localDataSourceObject = {
    "test": {
        "local": {
            "name": "Find your Perfume",
            "header": "Questions to go:",
            "resultHeader": "Result:",
            "silentResult": "Thanks!"
        },
        "questions": [
            {
                "questionText": "Is that first question text?",
                "pictureSource": "images/questions/qst_1.png",
                "answers": [
                    {
                        "answerText": "That is the first answer for the first question",
                        "score": 0,
                        "name": "a1",
                        "comb": "#comb_1_1#"
                    },
                    {
                        "answerText": "That is the second answer for the first question",
                        "score": 5,
                        "name": "a2",
                        "comb": "#comb_1_2#"
                    },
                    {
                        "answerText": "That is the third answer for the first question",
                        "score": 10,
                        "name": "a3",
                        "comb": "#comb_1_3#"
                    },
                    {
                        "answerText": "That is the fourth answer for the first question",
                        "score": 15,
                        "name": "a4",
                        "comb": "#comb_1_4#"
                    }
                ]
            },
            {
                "questionText": "Is that second question text?",
                "pictureSource": "images/questions/qst_1.png",
                "answers": [
                    {
                        "answerText": "That is the first answer for the second question",
                        "score": 15,
                        "name": "a1",
                        "comb": "#comb_2_1#"
                    },
                    {
                        "answerText": "That is the second answer for the second question",
                        "score": 5,
                        "name": "a2",
                        "comb": "#comb_2_2#"
                    },
                    {
                        "answerText": "That is the third answer for the second question",
                        "score": 0,
                        "name": "a3",
                        "comb": "#comb_2_3#"
                    },
                    {
                        "answerText": "That is the fourth answer for the second question",
                        "score": 10,
                        "name": "a4",
                        "comb": "#comb_2_4#"
                    }
                ]
            },
            {
                "questionText": "Is that third question text?",
                "pictureSource": "images/questions/qst_1.png",
                "answers": [
                    {
                        "answerText": "That is the first answer for the third question",
                        "score": 0,
                        "name": "a1",
                        "comb": "#comb_3_1#"
                    },
                    {
                        "answerText": "That is the second answer for the third question",
                        "score": 5,
                        "name": "a2",
                        "comb": "#comb_3_2#"
                    },
                    {
                        "answerText": "That is the third answer for the third question",
                        "score": 10,
                        "name": "a3",
                        "comb": "#comb_3_3#"
                    },
                    {
                        "answerText": "That is the fourth answer for the third question",
                        "score": 15,
                        "name": "a4",
                        "comb": "#comb_3_4#"
                    }
                ]
            }
        ],
        "results": {
            "a1": {
                "minScore": 0,
                "maxScore": 5,
                "comb": "#comb_1_1##comb_2_3##comb_3_1#",
                "redirect": "http://www.example.com/redirect_1",
                "HTMLPage": "html_results/result_1.html"
            },
            "a2": {
                "minScore": 6,
                "maxScore": 50,
                "comb": "#comb_1_1##comb_2_2##comb_3_3#",
                "redirect": "http://www.example.com/redirect_1",
                "HTMLPage": "html_results/result_2.html"
            },
            "default": {
                "redirect": "http://www.example.com/redirect_42",
                "HTMLPage": "html_results/default.html"
            }
        }
    }
};


var userTest = {
    "settings": {
        /**
         * Common quiz settings
         */
        "dataSource": "jsCustomTest.xml",       // data file name must be on the same domain. XML or JSON format. special case: "data.local"
        "formListener": "submit.php",           // Script/Servlet name that listens for result data.
        "targetDiv": "jsCustomTest",            // Div where quiz will be build
        "showQuestionsOneByOne": {
            "enabled": true,                        // Show ony current question
            "mode": "hide"                          // "hide" or "collapse" others
        },
        "useDefaultResult": true,               // If no result was found use default. May be especially useful with calculation == "comb".
        "calculation": "popular",               // "popular", "score", "comb"
        "resultPage": "HTMLPage",               // "redirect", "silent", "HTMLPage"

        /**
         * Settings for "resultPage": "silent"
         */
        "selfDestruction": {
            "enabled": true,                        // Delete quiz div from DOM after complete. (Works only if "resultPage" is set to "silent")
            "destructionTimer": 5000                // Time before self-destruction initiated in ms. 1000ms = 1 second.
        }
    },

    /**
     * Method is used for:
     * 1) loading file with quiz data from server using AJAX.
     * 2) Parsing data file.
     * 3) Filling global object userTest with extracted data.
     */
    getData: function () {
        userTest.local = {};
        userTest.localAnsw = {};
        userTest.localQst = [];
        userTest.targetDiv = $('#' + userTest.settings.targetDiv);

        if (userTest.targetDiv[0] == undefined) {
            throw "Exception: Can not find DIV to render quiz. " +
                "Current setting is: 'targetDiv': '" + userTest.settings.targetDiv + "'.";
        }

        // Substring filename to get its extension
        var dataFileFormat = userTest.settings.dataSource.toLowerCase()
            .substring(userTest.settings.dataSource.lastIndexOf(".") + 1);

        // If source is set to local data then we do not try to get test data from server
        if (userTest.settings.dataSource === "data.local") {
            parse(localDataSourceObject, dataFileFormat);
        } else {
            // Making GET request to get quiz data
            $.get(userTest.settings.dataSource, function (data) {
                parse(data, dataFileFormat)
            }, dataFileFormat);
        }

        /**
         * Function that fills in global object userTest with data.
         * @param doc - requested and hopefully downloaded quiz data
         * @param dataFileFormat - parsed file format. JSON or XML.
         */
        function parse(doc, dataFileFormat) {

            function parseXML(doc) {
                /**
                 * Utility function to fill in global object userTest.local{} with localization data
                 * @param tags - List of key:value elements. Texts that will be displayed in UI.
                 */
                function fillLocalData(tags) {
                    for (var i = 0; i < tags.length; i += 1) {
                        try {
                            userTest.local[tags[i]] = doc.getElementsByTagName(tags[i])[0].firstChild.data;
                        } catch (e) {
                            console.log("Error accessing data file element with tag:" + tags[i]);
                        }
                    }
                }

                /**
                 *  Tag names used to access localisation data in XML document
                 */
                var locals = [
                    "name",             // test name that is used in test header
                    "header",           // phrase "Questions to go".
                    "resultHeader",     // word "Result".
                    "silentResult"      // text for Silent submit answer
                ];

                // Executing utility function to populate localisation data
                fillLocalData(locals);

                // Getting list of question nodes from XML DOM
                var questions = doc.getElementsByTagName("question");
                userTest.qstAmount = questions.length; // Saving amount of questions to add classNames in future.

                // Saving test questions and question answers in userTest global object
                for (var q = 0, qL = questions.length; q < qL; q += 1) {
                    var nameQst = questions[q].getAttribute("name"),
                        newQuestion = {};
                    newQuestion.name = nameQst;

                    for (var t = questions[q].firstChild; t != null; t = t.nextSibling) {
                        // Looking for question text
                        if (t.tagName == "text") { // Saving question text
                            newQuestion.questionText = t.firstChild.data;
                        }

                        // Looking for question picture path
                        if (t.tagName == "picture") { // Saving link to question picture
                            if (t.firstChild != null) {
                                newQuestion.pictureSource = t.firstChild.data;
                            }
                        }
                    }

                    // Start populating answers data
                    newQuestion.answers = [];
                    for (var n = questions[q].firstChild; n != null; n = n.nextSibling) {
                        if (n.tagName == "answers") {
                            for (var i = n.firstChild; i != null; i = i.nextSibling) {
                                if (i.tagName == "answer") {

                                    /**
                                     * Dealing with answers attributes
                                     * Depending on settings parameter "calculation" collecting data.
                                     * Example: if calculation == score than deal just with score attribute. Ignoring "name" and "comb".
                                     */

                                    var answerValue,
                                        newAnswer,
                                        currentAnswerName = null;

                                    if (i.getAttribute("name")) {
                                        currentAnswerName = i.getAttribute("name");
                                        newAnswer = {};
                                        newAnswer.name = currentAnswerName;
                                    } else {
                                        throw "Exception: Name attribute is not provided for an answer."
                                    }


                                    switch (userTest.settings.calculation) {
                                        case "popular":
                                        {
                                            // pass
                                        }
                                            break;

                                        case "score":
                                        {
                                            if (i.getAttribute("score")) {
                                                answerValue = i.getAttribute("score");
                                                newAnswer.score = answerValue;
                                            } else {
                                                throw "Exception: Score attribute is not provided for an answer."
                                            }

                                        }
                                            break;

                                        case "comb":
                                        {
                                            if (i.getAttribute("comb")) {
                                                answerValue = i.getAttribute("comb");
                                                newAnswer.comb = answerValue;
                                            } else {
                                                throw "Exception: Comb attribute is not provided for an answer."
                                            }

                                        }
                                            break;

                                        default:
                                            throw "Exception: userTest.settings.calculation method is unsupported"
                                    }

                                    if (i.firstChild.data) {
                                        newAnswer.answerText = i.firstChild.data;
                                    } else {
                                        throw "Exception: Label for answer " + currentAnswerName + " in question" + nameQst + " is empty";
                                    }

                                    newQuestion.answers.push(newAnswer);
                                }
                            }
                        }
                    }

                    userTest.localQst.push(newQuestion);
                }

                // Saving test result variants in object
                var results = doc.getElementsByTagName("result");

                if (!results) {
                    throw "Exception: Was not able to find results in data file.";
                }

                for (var r = 0, rL = results.length; r < rL; r += 1) {
                    var resultName = results[r].getAttribute("name");

                    if (!results[r].getAttribute("name")) {
                        throw "Exception: Required name attribute is missing for at least one of results in data file";
                    }

                    userTest.localAnsw[resultName] = {
                        "minScore": results[r].getAttribute("minScore"),
                        "maxScore": results[r].getAttribute("maxScore"),
                        "comb": results[r].getAttribute("comb"),
                        "links": []
                    };

                    for (var s = results[r].firstChild; s != null; s = s.nextSibling) {
                        switch (s.tagName) {
                            case "HTMLPage":
                            {
                                if (s.firstChild != null) {
                                    userTest.localAnsw[resultName].HTMLPage = s.firstChild.data;
                                }
                            }
                                break;

                            case "redirect":
                            {
                                if (s.firstChild != null) {
                                    userTest.localAnsw[resultName].redirect = s.firstChild.data;
                                }
                            }
                                break;

                            default: {
                                // pass
                            }
                        }
                    }
                }
            }

            function parseJSON(doc) {
                userTest.local = doc["test"].local;
                userTest.localQst = doc["test"]["questions"];
                userTest.localAnsw = doc["test"]["results"];

                // Calculate number of questions
                userTest.qstAmount = 0;

                for (var i in userTest.localQst) {
                    if (userTest.localQst.hasOwnProperty(i)) {
                        userTest.qstAmount += 1;
                    }
                }
            }

            switch (dataFileFormat) {
                case "xml":
                {
                    parseXML(doc);
                }
                    break;
                case "json":
                {
                    parseJSON(doc);
                }
                    break;

                // local data also saved as JavaScript object
                case "local":
                {
                    parseJSON(doc);
                }
                    break;
                default:
                {
                    throw "Exception: Data file type unknown: '" + dataFileFormat
                        + "' currently only XML and JSON are supported. " +
                        "In case of using local data source make sure name ends with '.local'";
                }
            }

            // Check default result presence
            if (userTest.settings.useDefaultResult && !userTest.localAnsw["default"]) {
                throw "Exception: 'useDefaultResult' is set to true but default result is not present in data file."
            }

            // Render quiz HTML page
            userTest.place();
        }

    },

    /**
     * Generates all HTML nodes, populates document fragment, appends fragment, registers events.
     */
    place: function () { // Generating HTML with questions and answers
        var testBodyDiv = $(document.createElement("div")).attr('id', 'testBodyDiv'),
            progressbar = $(document.createElement("div")).attr('id', 'progressbar'),
            fragment = $(document.createDocumentFragment()),
            testName = userTest.local.name,
            qstNumber = 0;

        // Adding and inserting HTML nodes into DOM
        for (var question in userTest.localQst) {
            if (!userTest.localQst.hasOwnProperty(question)) {
                continue;
            }

            qstNumber += 1; // Counting number of questions.
            var qstDiv = $(document.createElement("div")).attr('id', question);

            // Adding className to current qstDiv
            var classArray = [];
            classArray.push("question", qstNumber % 2 == 0 ? "questionOdd" : "questionEven");

            if (qstNumber == 1) {
                classArray.push("questionFirst");
            } else if (qstNumber == userTest.qstAmount) {
                classArray.push("questionLast");
            }

            qstDiv.addClass(classArray.join(' '));

            // Generate question number and question text nodes
            var qstNumSpan = $(document.createElement("span")).append(qstNumber + '.');
            qstDiv.append($(document.createElement("h3")).text(userTest.localQst[question].questionText)
                .prepend(qstNumSpan).on("click", userTest.toggleVis));

            var qstWrapper = $(document.createElement('div')).addClass('question_wrapper');

            if (userTest.settings.showQuestionsOneByOne.enabled && qstNumber != 1) {

                switch (userTest.settings.showQuestionsOneByOne.mode) {
                    case "collapse":
                    {
                        qstWrapper.css("display", "none");
                    }
                        break;
                    case "hide":
                    {
                        qstDiv.css("display", "none");
                    }
                        break;
                    default:
                    {
                        throw "Exception: unknown mode in 'userTest.settings.showQuestionsOneByOne.mode'";
                    }
                }
            }

            // Insert question picture if present.
            if (typeof (userTest.localQst[question].pictureSource) != 'undefined') {
                qstWrapper.append($(document.createElement("img")).attr('src', userTest.localQst[question].pictureSource));
            }

            testBodyDiv.append(qstDiv);

            var ulNode = $(document.createElement("ul")).attr('id', question + 'List');

            qstWrapper.append(ulNode);

            qstDiv.append(qstWrapper);


            // Adding question answers and inputs in lists
            for (var answer in userTest.localQst[question].answers) {
                if (userTest.localQst[question].answers.hasOwnProperty(answer)) {

                    var questionAnswer = userTest.localQst[question].answers[answer]["answerText"],
                        labelNode = $(document.createElement("label")),
                        inputNode = null,
                        answerValue;

                    switch (userTest.settings.calculation) {
                        case "popular":
                        {
                            answerValue = userTest.localQst[question].answers[answer].name;
                        }
                            break;

                        case "score":
                        {
                            answerValue = userTest.localQst[question].answers[answer].score;
                        }
                            break;

                        case "comb":
                        {
                            answerValue = userTest.localQst[question].answers[answer].comb;
                        }
                            break;

                        default:
                            throw "Exception: userTest.settings.calculation method is unsupported";
                    }

                    var answerID = question + "_" + answer;

                    if (!inputNode) {
                        inputNode = $(document.createElement("input")).attr({
                            'type': 'radio',
                            'name': question,
                            'value': answerValue,
                            'id': answerID
                        });
                    }

                    // Registering event handler
                    $(inputNode).on("click", userTest.analyze).on("click", userTest.toggleVis);

                    labelNode.text(questionAnswer).attr('for', answerID);

                    var liNode = $(document.createElement("li")).append(inputNode).append(labelNode);

                    ulNode.append(liNode);
                }
            }
        }

        var h2Node = $(document.createElement("h2")).attr('id', 'testHeaderH2');
        h2Node.append(testName);

        fragment.append(h2Node).append(progressbar).append(testBodyDiv);

        userTest.targetDiv.append(fragment); // Append documentFragment childes to DOM
    },
    /**
     * Method is used to calculate result depending on algorithm
     * @param event - JS event object
     */
    analyze: function (event) { // Event handler. Calculates answered questions. If finished initiates result()
        var calc = userTest.settings.calculation,
            progressbar = $("#progressbar"),
            testHeader = $("#testHeaderH2"),
            headerMsg;

        if ($("#progresscol").length == 0) {
            progressbar.append($(document.createElement("div")).attr('id', 'progresscol'));
        }

        // If input clicked - Marking target H3 with className "answered"
        // Searching for header tag.

        $(event.target).closest('.question').find('h3:first').addClass('answered');

        // Slide next question if we are hiding them. (showQuestionsOneByOne.enabled == true)
        if (userTest.settings.showQuestionsOneByOne.enabled) {
            // Find next question content and show it
            switch (userTest.settings.showQuestionsOneByOne.mode) {
                case "collapse":
                {
                    $("#" + $(event.target).closest('.question')[0].id).next().find('.question_wrapper').slideDown();
                }
                    break;
                case "hide":
                {
                    $("#" + $(event.target).closest('.question')[0].id).next('.question').slideDown();
                }
                    break;
                default:
                {
                    //pass
                }
            }
        }

        /**
         * Saving current answer in global object
         * Depending on settings (userTest.settings.calculation) changes value of max, score or comb will be used.
         * Init if never used before.
         */
        if (!userTest[calc]) {
            userTest[calc] = {};
        }

        userTest[calc][this.name] = this.value;

        // Changing answered questions counter
        userTest.qstDone = 0;
        for (var m in userTest[calc]) {
            if (userTest[calc].hasOwnProperty(m)) {
                userTest.qstDone += 1;
            }
        }

        // Showing number of unanswered in header.
        headerMsg = userTest.local.header + " " + (userTest.qstAmount - userTest.qstDone);

        // If all questions are answered
        if (userTest.qstAmount == userTest.qstDone) {
            // Change header text
            headerMsg = userTest.local["resultHeader"];
            testHeader.text(headerMsg);

            // Hide progressbar =)
            progressbar.hide();

            // Render result page
            userTest.result();
        }

        if (testHeader.length > 0) {
            testHeader.fadeOut('fast', function () {
                $(this).text(headerMsg).fadeIn('fast');
            });

            // Updating progress bar animation here
            $("#progresscol").animate({
                width: 100 - (userTest.qstAmount - userTest.qstDone) / (userTest.qstAmount / 100) + "%"
            });
        } else {
            testHeader.append($(document.createElement("h2")).text(headerMsg));

            $("#progresscol").css({
                'width': '0'
            });
        }
    },

    /**
     *  Calculating result.
     *  Choosing result variant.
     *  Building results page.
     */
    result: function () {
        var variant, result;

        switch (userTest.settings.calculation) {
            case "popular":
            {
                result = {};

                for (variant in userTest["popular"]) {
                    if (userTest["popular"].hasOwnProperty(variant)) {
                        result[userTest["popular"][variant]] ? result[userTest["popular"][variant]] += 1 : result[userTest["popular"][variant]] = 1;
                    }
                }

                var max = 0;

                for (var v in result) {
                    if (result.hasOwnProperty(v)) {
                        if (result[v] > max) {
                            max = result[v];
                            variant = v;
                        }
                    }
                }

                userTest.resultVariantObject = userTest.localAnsw[variant]; // Choosing what result to show

            }
                break;

            case "score":
            {
                result = 0;

                for (var s in userTest.score) {
                    if (userTest.score.hasOwnProperty(s)) {
                        result += parseInt(userTest.score[s]);
                    }
                }

                for (variant in userTest.localAnsw) {
                    if (userTest.localAnsw.hasOwnProperty(variant)) {
                        if (result >= userTest.localAnsw[variant]["minScore"]
                            && result <= userTest.localAnsw[variant]["maxScore"]) {
                            // Choosing what result to show
                            userTest.resultVariantObject = userTest.localAnsw[variant];
                        }
                    }
                }

            }
                break;

            case "comb":
            {
                result = "";

                for (var t in userTest.comb) {
                    if (userTest.comb.hasOwnProperty(t)) {
                        result += userTest.comb[t];
                    }
                }

                for (variant in userTest.localAnsw) {
                    if (userTest.localAnsw.hasOwnProperty(variant)) {
                        if (result == userTest.localAnsw[variant].comb) {
                            userTest.resultVariantObject = userTest.localAnsw[variant]; // Choosing what result to show
                        }
                    }
                }
            }
                break;
        }

        // Saving result in object for future generations and giant space ants.
        userTest.resultVariant = variant;

        // Checking if variant was found. If not - apply default or throw error.
        userTest.doResultCheck();

        var resultNode;

        // Depending on settings redirect, silently submit result or show result page.
        switch (userTest.settings.resultPage) {

            case "HTMLPage":
            {

                if (!userTest.resultVariantObject.HTMLPage) {
                    throw "Exception: [HTMLPage] is current result rendering setting, " +
                        "but no source set in data file '" + userTest.settings.dataSource + "'";
                }

                // Making GET request to get quiz data
                $.get(userTest.resultVariantObject.HTMLPage, function (data) {
                    resultNode = $(data).filter("#resultNode").html();

                    // Remove result header, questions node, append result node
                    userTest.targetDiv.fadeOut('fast', function () {
                        $(this).find('#testHeaderH2').remove();
                        $(this).find('#testBodyDiv').remove();

                        if (resultNode == undefined) {
                            throw "Exception: HTML result page '" + userTest.resultVariantObject.HTMLPage
                                + "' is not accessible or doesn't have DIV with id='resultNode'";
                        }

                        // Inserting parsed HTML from result HTMLPage source
                        $(this).append(resultNode);
                        $(this).fadeIn('fast');
                    });

                });

                //Submitting data for stat
                $.post(userTest.settings.formListener, {
                    result: userTest.resultVariant
                });

            }
                break;

            case "redirect":
            {
                //Submitting data for stat
                $.post(userTest.settings.formListener, {
                    result: userTest.resultVariant
                });

                if (!userTest.resultVariantObject.redirect) {
                    throw "Exception: [redirect] is current result rendering setting, " +
                        "but no source set in data file '" + userTest.settings.dataSource + "'";
                }

                // Note that redirect may be blocked by browser or browser plugins like AdBlock
                window.location = userTest.resultVariantObject.redirect;
            }
                break;

            case "silent":
            {
                // Answer text after submitting data
                resultNode = $(document.createElement("div")).attr('id', 'testResultDiv')
                    .append($(document.createElement("p")).attr('id', 'testResultP').text(userTest.local["loadingText"]));

                userTest.targetDiv.find('#testHeaderH2').remove();
                userTest.targetDiv.find('#testBodyDiv').remove(); // Removing DIV with questions and answers

                userTest.targetDiv.append(resultNode);

                // AJAX result submit
                var params, thanks;

                params = {
                    result: userTest.resultVariant
                };

                thanks = function () {
                    $("#testResultP").text(userTest.local["silentResult"]);
                };

                $.post(userTest.settings.formListener, params, thanks);

                // Delete test DIV after silent form submit.
                if (userTest.settings.selfDestruction.enabled) {
                    function destruction() {
                        userTest.targetDiv.remove();
                    }

                    // Sending DIV to the Walhalla in 3, 2, 1...
                    setTimeout(destruction, userTest.settings.selfDestruction.destructionTimer);
                }

            }
                break;

            default:
            {
                throw "Exception: Result page type unknown: '" + userTest.settings.resultPage + "'.";
            }
        }
    },

    /**
     * Clears DOM and restarts test script
     * Register an event handler for a button that should restart quiz
     * Simplest way to create a repeat button is:
     * <code>
     *     <button onclick="userTest.restart()">
     *         Restart
     *     </button>
     * </code>
     */
    restart: function () {
        userTest.targetDiv.empty();

        // Clear object
        userTest[userTest.settings.calculation] = {};

        userTest.place(); // Place all elements one more time
    },

    /**
     * Toggles visibility =)
     * @param event - JS event object
     */
    toggleVis: function (event) {
        var currentTarget = event.target;

        currentTarget = currentTarget.tagName.toUpperCase() == "INPUT"
            || currentTarget.tagName.toUpperCase() == "LABEL"
            ? $(currentTarget).parents('.question_wrapper') : $(currentTarget).next('.question_wrapper');

        if (currentTarget.length > 0) {
            currentTarget.slideToggle();
        }
    },

    doResultCheck: function () {
        // Checking if variant was found.
        if (!userTest.resultVariantObject) {

            if (userTest.settings.useDefaultResult) {
                userTest.resultVariant = "default";
                userTest.resultVariantObject = userTest.localAnsw["default"];

            } else {
                var errorMessage = "No result option for such a unique answers combination.";

                alert(errorMessage);
                throw errorMessage;
            }
        }
    },

    /**
     * Initialization function, should be fired on pageLoad event
     */
    init: function () {
        userTest.getData();
    }
};


/**
 * Gently asking jQuery to start function on page load.
 * Everything starts from this line.
 */
$(userTest.init);