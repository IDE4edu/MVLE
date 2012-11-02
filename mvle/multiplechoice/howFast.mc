{
   "assessmentItem": {
      "adaptive": false,
      "identifier": "MultipleChoice",
      "interaction": {
         "choices": [
            {
               "feedback": "\n            Computers are much, much faster than this!\n            Almost everything a computer does\n            involves adding numbers together.  Even drawing a\n            simple shape can make a computer add hundreds or thousands of numbers\n            together.\n          ",
               "fixed": true,
               "identifier": "choice 1",
               "text": "\n          It can add them together about once a second.\n        "
            },
            {
               "feedback": "\n            Computers are faster than this!  The UNIVAC,\n            first made in 1951, could add\n            100,000 ten-digit numbers together each second.\n          ",
               "fixed": true,
               "identifier": "choice 2",
               "text": "\n          It can add them together about 1,000 times a second.\n        "
            },
            {
               "feedback": "\n            This answer is closest to correct.  However, different\n            computers can vary widely in their\n            computational power.  An iPhone may be cool but\n            its processor gets owned by a Sun workstation.\n            And, even being able to add 100,000,000 numbers a second\n            is <b>not</b> instantly; many problems require\n            much, much more adding than that.\n          ",
               "fixed": true,
               "identifier": "choice 3",
               "text": "\n          It can add them together about 100,000,000 times a\n          second.\n        "
            },
            {
               "feedback": "\n            All computers have limits, and this will never\n            change.  It's easy to think up problems  that are\n            simple to describe but would take a modern computer a century to calculate!\n          ",
               "fixed": true,
               "identifier": "choice 4",
               "text": "\n          It adds numbers instantly.\n        "
            }
         ],
         "hasInlineFeedback": true,
         "maxChoices": "1",
         "prompt": "\n          <span audio=\"1\">Select the single best answer to the question.</span>\n          \n          <p audio=\"2\" id=\"multichoice1\" style=\"font-weight:bold\">\n          How long does it take a typical home computer\n          to add two big numbers together?\n          </p>\n        ",
         "responseIdentifier": "MultipleChoice",
         "shuffle": false
      },
      "responseDeclaration": {
         "correctResponse": ["choice 3"],
         "identifier": "MultipleChoice"
      },
      "timeDependent": false
   },
   "type": "MultipleChoice"
}