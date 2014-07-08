/**
 * Created with Intellij IDEA.
 * User: xmapact
 * Date: 12/1/13
 * Time: 4:22 PM
 */
/*global $, document, window, setTimeout */

var quizConstants = {
    result: {
        REDIRECT: "redirect",
        SILENT: "silent",
        HTML_PAGE: "HTMLPage"
    },

    calculation: {
        POPULAR: "popular",
        SCORE: "score",
        COMB: "comb"
    },

    questionAnimation: {
        HIDE: "hide",
        COLLAPSE: "collapse"
    }
};

var userTest = {

    settings: {
        /**
         * Common quiz settings
         */
        "dataSource": "jsCustomTest.json",              // URL that points to JSON source (in this case it is a file)
        "formListener": "submit.php",                   // Relative path to server page that listens for result data.
        "targetDiv": "jsCustomTest",                    // Div where quiz will be build
        "showQuestionsOneByOne": {
            "enabled": true,                            // Show ony current question
            "mode": quizConstants.questionAnimation.HIDE     // "HIDE" or "COLLAPSE" not active question
        },
        "useDefaultResult": true,                       // If no result was found use default. May be especially useful with calculation "COMB".
        "calculation": quizConstants.calculation.POPULAR,    // "POPULAR", "SCORE", "COMB"
        "resultPage": quizConstants.result.HTML_PAGE,        // "REDIRECT", "SILENT", "HTML_PAGE"

        /**
         * Settings ONLY for "resultPage":
         * "userTest.result.SILENT"
         */
        "selfDestruction": {
            "enabled": true,                            // Delete quiz div from DOM after complete. (Works only if "resultPage" is set to "silent")
            "destructionTimer": 5000                    // Time before self-destruction initiated in ms. 1000ms = 1 second.
        }
    },

    utils: {
        isAllAnswered: function () {
            "use strict";
            var calc = userTest.settings.calculation,
                answer;

            // Counting number of answered questions
            userTest.qstDone = 0;
            for (answer in userTest[calc]) {
                if (userTest[calc].hasOwnProperty(answer)) {
                    userTest.qstDone += 1;
                }
            }

            return userTest.qstTotalNumber === userTest.qstDone;
        },

        isTargetDivPresent: function () {
            "use strict";
            return userTest.targetDiv[0] !== undefined;
        },

        validateMinRequiredObjModel: function (localNames, results, questions) {
            "use strict";
            if (localNames.length < 4) {
                throw "Not all local names are present in JSON source";
            }

            if (results.length < 1) {
                throw "Was not able to locate results in JSON source";
            }

            if (questions.length < 1) {
                throw "Was not able to locate questions in JSON source";
            }

            // Check default result presence if we need it
            if (userTest.settings.useDefaultResult && !userTest.localAnsw["default"]) {
                throw "Exception: 'useDefaultResult' is set to true " +
                    "but default result is not present in data file.";
            }
        },

        doResultCheck: function () {
            "use strict";
            // Checking if variant was found.
            if (!userTest.resultVariantObject) {
                if (userTest.settings.useDefaultResult) {
                    userTest.resultVariant = "default";
                    userTest.resultVariantObject = userTest.localAnsw["default"];
                } else {
                    throw "No result option for such a unique answers combination.";
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
            "use strict";
            userTest.targetDiv.empty();

            // Clear object
            userTest[userTest.settings.calculation] = {};

            userTest.place(); // Place all elements one more time
        },

        /**
         * Toggles visibility of question when it is clicked.
         * Finds question wrapper element based on event target.
         * @param event - JS event object
         */
        toggleVisibility: function (event) {
            "use strict";
            var currentTarget = event.target;

            currentTarget = currentTarget.tagName.toUpperCase() === "INPUT" ||
                currentTarget.tagName.toUpperCase() === "LABEL" ?
                $(currentTarget).parents('.question_wrapper') : $(currentTarget).next('.question_wrapper');

            if (currentTarget.length > 0) {
                currentTarget.slideToggle();
            }
        }
    },

    createNodes: {
        createHeader: function () {
            "use strict";
            var h2Node = $(document.createElement("h2")).attr('id', 'testHeaderH2');
            h2Node.append(userTest.local.name);

            return h2Node;
        },
        createProgressBar: function () {
            "use strict";
            return $(document.createElement("div")).attr('id', 'progressbar');
        },
        createAnswersNode: function (question) {
            "use strict";
            var ulNode = $(document.createElement("ul")).attr('id', question + 'List'),
                answer,
                questionAnswer,
                labelNode,
                answerValue,
                answerID,
                inputNode,
                liNode;

            // Adding question answers and inputs in lists
            for (answer in userTest.localQst[question].answers) {
                if (userTest.localQst[question].answers.hasOwnProperty(answer)) {

                    questionAnswer = userTest.localQst[question].answers[answer].answerText;
                    labelNode = $(document.createElement("label"));

                    switch (userTest.settings.calculation) {
                        case quizConstants.calculation.POPULAR:
                            answerValue = userTest.localQst[question].answers[answer].name;
                            break;

                        case quizConstants.calculation.SCORE:
                            answerValue = userTest.localQst[question].answers[answer].score;
                            break;

                        case quizConstants.calculation.COMB:
                            answerValue = userTest.localQst[question].answers[answer].comb;
                            break;

                        default:
                            throw "Exception: userTest.settings.calculation method is unsupported";
                    }

                    answerID = question + "_" + answer;
                    inputNode = $(document.createElement("input")).attr({
                        'type': 'radio',
                        'name': question,
                        'value': answerValue,
                        'id': answerID
                    });

                    // Registering event handler
                    $(inputNode).on("click", userTest.analyze).on("click", userTest.utils.toggleVisibility);

                    labelNode.text(questionAnswer).attr('for', answerID);
                    liNode = $(document.createElement("li")).append(inputNode).append(labelNode);
                    ulNode.append(liNode);
                }
            }

            return ulNode;
        },
        createSingleQuestion: function (question, qstNumber) {
            "use strict";
            var qstDiv = $(document.createElement("div")).attr('id', question),
                cssClassesArray = [],
                qstNumSpan,
                qstWrapper,
                ulNode;

            cssClassesArray.push("question", qstNumber % 2 === 0 ? "questionOdd" : "questionEven");

            if (qstNumber === 1) {
                cssClassesArray.push("questionFirst");
            } else if (qstNumber === userTest.qstTotalNumber) {
                cssClassesArray.push("questionLast");
            }

            qstDiv.addClass(cssClassesArray.join(' '));

            // Generate question number and question text nodes
            qstNumSpan = $(document.createElement("span")).append(qstNumber + '.');
            qstDiv.append($(document.createElement("h3")).text(userTest.localQst[question].questionText)
                .prepend(qstNumSpan).on("click", userTest.utils.toggleVisibility));

            qstWrapper = $(document.createElement('div')).addClass('question_wrapper');

            if (userTest.settings.showQuestionsOneByOne.enabled && qstNumber !== 1) {

                switch (userTest.settings.showQuestionsOneByOne.mode) {
                    case quizConstants.questionAnimation.COLLAPSE:
                        qstWrapper.css("display", "none");
                        break;
                    case quizConstants.questionAnimation.HIDE:
                        qstDiv.css("display", "none");
                        break;
                    default:
                        throw "Exception: unknown mode in 'userTest.settings.showQuestionsOneByOne.mode'";
                }
            }

            // Insert question picture if present.
            if (typeof (userTest.localQst[question].pictureSource) !== "undefined") {
                qstWrapper.append($(document.createElement("img")).attr('src', userTest.localQst[question].pictureSource));
            }

            ulNode = userTest.createNodes.createAnswersNode(question);

            qstWrapper.append(ulNode);
            qstDiv.append(qstWrapper);

            return qstDiv;
        },
        createQuestions: function () {
            "use strict";
            var testBodyDiv = $(document.createElement("div")).attr('id', 'testBodyDiv'),
                qstNumber = 0,
                question,
                qstDiv;

            for (question in userTest.localQst) {
                if (userTest.localQst.hasOwnProperty(question)) {
                    // Counting number of questions in order to assign proper CSS classes and header prefixes.
                    qstNumber += 1;
                    qstDiv = userTest.createNodes.createSingleQuestion(question, qstNumber);

                    testBodyDiv.append(qstDiv);
                }
            }

            return testBodyDiv;
        }
    },

    updateView: {
        headerNode: function () {
            "use strict";
            var testHeader = $("#testHeaderH2"),
                headerMsg;

            if (userTest.utils.isAllAnswered()) {
                headerMsg = userTest.local.resultHeader;
            } else {
                headerMsg = userTest.local.header + " " + (userTest.qstTotalNumber - userTest.qstDone);
            }

            testHeader.text(headerMsg);

            if (testHeader.length === 0) {
                testHeader.append($(document.createElement("h2")).text(headerMsg));
            } else {
                testHeader.fadeOut('fast', function () {
                    $(this).text(headerMsg).fadeIn('fast');
                    userTest.updateView.progressBarNode();
                });
            }
        },

        progressBarNode: function () {
            "use strict";
            var progressbar = $("#progressbar"),
                progressColumn = $("#progresscol");

            // If progressbar is not shown then we will show it.
            if (progressColumn.length === 0) {
                progressbar.append($(document.createElement("div")).attr('id', 'progresscol').animate({
                    width: (100 - (userTest.qstTotalNumber - userTest.qstDone) / (userTest.qstTotalNumber / 100)) + "%"
                }));
            }
            // Updating progress bar animation here
            progressColumn.animate({
                width: (100 - (userTest.qstTotalNumber - userTest.qstDone) / (userTest.qstTotalNumber / 100)) + "%"
            });

            if (userTest.utils.isAllAnswered()) {
                progressbar.hide();
            }
        },

        questionNode: function (event) {
            "use strict";
            var questionNode = $("#" + $(event.target).closest('.question')[0].id);
            // If input clicked - Marking target H3 with className "answered"
            // Searching for header tag.
            $(event.target).closest('.question').find('h3:first').addClass('answered');

            // Slide next question if we are hiding them. (showQuestionsOneByOne.enabled == true)
            if (userTest.settings.showQuestionsOneByOne.enabled) {
                // Find next question content and show it
                switch (userTest.settings.showQuestionsOneByOne.mode) {
                    case quizConstants.questionAnimation.COLLAPSE:
                        questionNode.next().find('.question_wrapper').slideDown();
                        break;
                    case quizConstants.questionAnimation.HIDE:
                        questionNode.next('.question').slideDown();
                        break;
                    default:
                        throw "Show questions 'one by one' is enabled but wrong mode is set: " +
                            userTest.settings.showQuestionsOneByOne.mode;
                }
            }

            userTest.updateView.headerNode();
        }
    },

    calculateResult: {
        popular: function () {
            "use strict";
            var result = {},
                popular = userTest[quizConstants.calculation.POPULAR],
                variant,
                max,
                v;

            for (variant in popular) {
                if (popular.hasOwnProperty(variant)) {
                    if (result[popular[variant]]) {
                        result[popular[variant]] += 1;
                    } else {
                        result[popular[variant]] = 1;
                    }
                }
            }

            max = 0;

            for (v in result) {
                if (result.hasOwnProperty(v)) {
                    if (result[v] > max) {
                        max = result[v];
                        variant = v;
                    }
                }
            }

            // Result to show
            userTest.resultVariantObject = userTest.localAnsw[variant];

            return variant;
        },

        score: function () {
            "use strict";
            var result = 0,
                score = userTest[quizConstants.calculation.SCORE],
                answer,
                variant;

            for (answer in score) {
                if (score.hasOwnProperty(answer)) {
                    result += parseInt(score[answer], 10);
                }
            }

            for (variant in userTest.localAnsw) {
                if (userTest.localAnsw.hasOwnProperty(variant)) {
                    if (result >= userTest.localAnsw[variant].minScore &&
                        result <= userTest.localAnsw[variant].maxScore) {
                        // Result to show
                        userTest.resultVariantObject = userTest.localAnsw[variant];

                        return variant;
                    }
                }
            }
        },

        comb: function () {
            "use strict";
            var result = "",
                comb = userTest[quizConstants.calculation.COMB],
                variant,
                answer;

            for (answer in comb) {
                if (comb.hasOwnProperty(answer)) {
                    result += comb[answer];
                }
            }

            for (variant in userTest.localAnsw) {
                if (userTest.localAnsw.hasOwnProperty(variant)) {
                    if (result === userTest.localAnsw[variant].comb) {
                        // Result to show
                        userTest.resultVariantObject = userTest.localAnsw[variant];
                    }
                }
            }

            return variant;
        }
    },

    renderResult: {
        HTMLPage: function () {
            "use strict";
            if (!userTest.resultVariantObject.HTMLPage) {
                throw "Exception: [HTMLPage] is current result rendering setting, " +
                    "but no source set in data file '" + userTest.settings.dataSource + "'";
            }

            // Making GET request to get quiz data
            $.get(userTest.resultVariantObject.HTMLPage, function (data) {
                var resultNode = $(data).filter("#resultNode").html();

                // Remove result header, questions node, append result node
                userTest.targetDiv.fadeOut('fast', function () {
                    $(this).find('#testHeaderH2').remove();
                    $(this).find('#testBodyDiv').remove();

                    if (resultNode === undefined) {
                        throw "Exception: HTML result page '" + userTest.resultVariantObject.HTMLPage +
                            "' is not accessible or doesn't have DIV with id='resultNode'";
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
        },

        redirect: function () {
            "use strict";
            if (!userTest.resultVariantObject.redirect) {
                throw "Exception: [redirect] is current result rendering setting, " +
                    "but no source set in data file '" + userTest.settings.dataSource + "'";
            }

            // Note that redirect may be blocked by browser or browser plugins like AdBlock
            window.location = userTest.resultVariantObject.redirect;
        },

        silent: function () {
            "use strict";
            // Answer text after submitting data
            var params,
                thanks,
                resultNode = $(document.createElement("div")).attr('id', 'testResultDiv')
                    .append($(document.createElement("p")).attr('id', 'testResultP')
                        .text(userTest.local.loadingText));

            userTest.targetDiv.find('#testHeaderH2').remove();
            userTest.targetDiv.find('#testBodyDiv').remove(); // Removing DIV with questions and answers

            userTest.targetDiv.append(resultNode);

            // AJAX result submit
            params = {
                result: userTest.resultVariant
            };

            thanks = function () {
                $("#testResultP").text(userTest.local.silentResult);
            };

            $.post(userTest.settings.formListener, params, thanks);

            // Delete test DIV after silent form submit.
            if (userTest.settings.selfDestruction.enabled) {
                // Sending DIV to the Walhalla in 3, 2, 1...
                setTimeout(function () {
                    userTest.targetDiv.remove();
                }, userTest.settings.selfDestruction.destructionTimer);
            }
        }
    },

    /**
     * Method is used for:
     * 1) Loading file with quiz data from server using AJAX.
     * 2) Parsing data file.
     * 3) Filling global object userTest with extracted data.
     */
    getData: function () {
        "use strict";
        /**
         * Function that fills-in global object userTest with data.
         * @param doc - requested and hopefully downloaded quiz data
         */
        function parse(doc) {
            var question;
            userTest.targetDiv = $('#' + userTest.settings.targetDiv);

            // First of all check if there is a place where we will deploy quiz
            if (!userTest.utils.isTargetDivPresent()) {
                throw "Exception: Can not find DIV to render quiz. " +
                    "Current setting is: 'targetDiv': '" + userTest.settings.targetDiv + "'.";
            }

            userTest.local = doc.test.local;
            userTest.localAnsw = doc.test.results;
            userTest.localQst = doc.test.questions;

            // Make a simple validation to see if needed data is present in source
            userTest.utils.validateMinRequiredObjModel(
                userTest.local,
                userTest.localAnsw,
                userTest.localQst
            );

            // Calculate number of questions
            userTest.qstTotalNumber = 0;

            for (question in userTest.localQst) {
                if (userTest.localQst.hasOwnProperty(question)) {
                    userTest.qstTotalNumber += 1;
                }
            }

            // Render quiz HTML page
            userTest.place();
        }

        // Making GET request to get quiz data
        $.get(userTest.settings.dataSource, function (data) {
            parse(data);
        }, "json");
    },

    /**
     * Generates all HTML nodes
     * Populates document fragment
     * Appends fragment
     * Registers events
     */
    place: function () {
        "use strict";
        // Generating HTML with questions and answers
        var fragment = $(document.createDocumentFragment()),
            quizHeader = userTest.createNodes.createHeader(),
            progressbar = userTest.createNodes.createProgressBar(),
            testBodyDiv = userTest.createNodes.createQuestions();

        // Adding generated nodes to document fragment.
        fragment.append(quizHeader).append(progressbar).append(testBodyDiv);
        // Appending results to DOM
        userTest.targetDiv.append(fragment);
    },

    /**
     * Method is used to calculate result depending on algorithm
     * Event handler. Calculates answered questions.
     * If all questions answered initiates userTest.result().
     * @param event - JS event object
     */
    analyze: function (event) {
        "use strict";
        /*
         * Creating a global object that will keep all answers values.
         * Depending on calculation settings we will look for "name", "score" or "comb" attributes.
         */
        var calc = userTest.settings.calculation;

        if (!userTest[calc]) {
            // Init if never used before.
            userTest[calc] = {};
        }
        userTest[calc][this.name] = this.value;

        userTest.updateView.questionNode(event);

        // If all questions are answered
        if (userTest.utils.isAllAnswered()) {
            // Render result page
            userTest.showResult();
        }
    },


    /**
     *  Calculating result.
     *  Choosing result variant.
     *  Building results page.
     */
    showResult: function () {
        "use strict";
        switch (userTest.settings.calculation) {
            case quizConstants.calculation.POPULAR:
                userTest.resultVariant = userTest.calculateResult.popular();
                break;

            case quizConstants.calculation.SCORE:
                userTest.resultVariant = userTest.calculateResult.score();
                break;

            case quizConstants.calculation.COMB:
                userTest.resultVariant = userTest.calculateResult.comb();
                break;
        }

        // Checking if variant was found.
        // If not - apply default or throw error.
        userTest.utils.doResultCheck();

        //Submitting data for statistics
        $.post(userTest.settings.formListener, {
            result: userTest.resultVariant
        });

        // Depending on settings: redirect, silently submit result or show result page.
        switch (userTest.settings.resultPage) {
            case quizConstants.result.HTML_PAGE:
                userTest.renderResult.HTMLPage();
                break;

            case quizConstants.result.REDIRECT:
                userTest.renderResult.redirect();
                break;

            case quizConstants.result.SILENT:
                userTest.renderResult.silent();
                break;

            default:
                throw "Exception: Result page type unknown: '" + userTest.settings.resultPage + "'.";
        }
    }
};


/**
 * Gently asking jQuery to start function on page load.
 * Everything starts from this line.
 */
$(userTest.getData);