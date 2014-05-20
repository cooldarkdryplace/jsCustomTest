/**
 * Created with IntelliJ IDEA.
 * User: xmapact
 * Date: 5/19/14
 * Time: 7:26 PM
 * To change this template use File | Settings | File Templates.
 */


questionsAndAnswers = {
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
                "redirect": "html_results/result_1.html",
                "HTMLPage": "html_results/result_1.html"
            },
            "a2": {
                "minScore": 6,
                "maxScore": 50,
                "comb": "#comb_1_1##comb_2_2##comb_3_3#",
                "redirect": "html_results/result_2.html",
                "HTMLPage": "html_results/result_2.html"
            },
            "default": {
                "redirect": "html_results/default.html",
                "HTMLPage": "html_results/default.html"
            }
        }
    }
};

