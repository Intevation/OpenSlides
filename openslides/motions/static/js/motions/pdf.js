(function () {

"use strict";

angular.module('OpenSlidesApp.motions.pdf', ['OpenSlidesApp.core.pdf'])

.factory('MotionContentProvider', [
    'gettextCatalog',
    'PDFLayout',
    'Category',
    'Config',
    function(gettextCatalog, PDFLayout, Category, Config) {
    /**
     * Provides the content as JS objects for Motions in pdfMake context
     * @constructor
     */

    var createInstance = function(converter, motion, $scope) {

        // title
        var identifier = motion.identifier ? ' ' + motion.identifier : '';
        var number;
        if (motion.agenda_item.getItemNumberWithAncestors().split(' ').length > 1) {
            number = motion.agenda_item.getItemNumberWithAncestors().split(' ').slice(1);
        } else {
            number = motion.agenda_item.getItemNumberWithAncestors();
        }
        var title = {
            columns: [
                {
                    columns: [
                        {
                            text: "TOP" + "\n" + gettextCatalog.getString('Motion'),
                            style: 'LAHTitle',
                            width: '30%'
                        },
                        {
                            text: number + "\n" + identifier,
                            style: 'LAHTitle',
                        }
                    ],
                    width: '60%'
                },
                {
                    image: Config.get('general_laek_logo').value,
                    fit: [190,50]
                }
            ]
        };

        // subtitle
        var subtitle = {
            text: '11. ordentliche Delegiertenversammlung 15. Wahlperiode 2013-2018\n26.11.2016 in Bad Nauheim',
            style: 'LAHSubtitle'
        };

        // submitters
        var submitters = _.map(motion.submitters, function (submitter) {
            return submitter.get_full_name();
        }).join(', ');

        // meta data table
        var metaTable = function() {
            var circleDistance = 10;
            var circleSize = 5;
            var metaTableBody = {
                table: {
                    widths: '100%',
                    body: [
                        [
                            {
                                columns: [
                                    {
                                        columns: [
                                            {
                                                text: 'Antragszurücknahme\nNichtbefassung\nVorstandsüberweisung',
                                                width: "auto",
                                                bold: true
                                            },
                                            {
                                                stack: [
                                                    {
                                                        canvas: PDFLayout.drawCircle(5 , circleSize)
                                                    },
                                                    {
                                                        canvas: PDFLayout.drawCircle(circleDistance , circleSize)
                                                    },
                                                    {
                                                        canvas: PDFLayout.drawCircle(circleDistance, circleSize)
                                                    }
                                                ],
                                                width: "auto",
                                                margin: [15, 4, 0, 0],
                                            }
                                        ],
                                        margin: [0, 5, 0, 5]
                                    },
                                    {
                                        columns: [
                                            {
                                                text: 'Antrag\nangenommen\nabgelehnt',
                                                width: "auto",
                                                bold: true
                                            },
                                            {
                                                stack: [
                                                    {
                                                        canvas: PDFLayout.drawCircle(18 , circleSize)
                                                    },
                                                    {
                                                        canvas: PDFLayout.drawCircle(circleDistance , circleSize)
                                                    }
                                                ],
                                                width: "auto",
                                                margin: [15, 5, 0, 0],
                                            }
                                        ],
                                        margin: [15, 5, 0, 5]
                                    },
                                    {
                                        columns: [
                                            {
                                                text: 'Ja-Stimmen\nNein-Stimmen\nEnthaltungen\n\nmit Mehrheit\neinstimmig',
                                                width: "auto",
                                                bold: true
                                            },
                                            {
                                                stack: [
                                                    {
                                                        canvas: PDFLayout.drawLine(12, 40)
                                                    },
                                                    {
                                                        canvas: PDFLayout.drawLine(15, 40)
                                                    },
                                                    {
                                                        canvas: PDFLayout.drawLine(15, 40)
                                                    },
                                                    {
                                                        canvas: PDFLayout.drawCircle(30, circleSize)
                                                    },
                                                    {
                                                        canvas: PDFLayout.drawCircle(circleDistance , circleSize)
                                                    }
                                                ],
                                                width: "auto",
                                                margin: [15, -1, 0, 0],
                                            }
                                        ],
                                        margin: [0, 5, 0, 5]
                                    }
                                ],
                                style: 'grey'
                            }
                        ]
                    ],
                }
            };
            return metaTableBody;
        };

        // motion title
        var motionTitle = function(name, title) {
            return [
                {
                    columns: [
                        {
                            text: name,
                            width: '20%',
                            style: 'LAHHeadding'
                        },
                        {
                            text: title
                        }
                    ],
                    margin: [0, 15, 0, 0]
                },
                {
                    canvas: [
                        {
                            type: 'line',
                            x1: 0, y1: 10,
                            x2: 430, y2: 10,
                            lineWidth: 1,
                            lineColor: 'grey',
                        }
                    ]
                }
            ];
        };


        // motion text (with line-numbers)
        var motionText = function() {
            var motionContent = [
                {
                    text: 'Beschlussvorschlag:',
                    style: 'LAHHeadding',
                    margin: [0,20,0,0]
                }
            ];
            if ($scope.lineNumberMode == "inline" || $scope.lineNumberMode == "outside") {
                /* in order to distinguish between the line-number-types we need to pass the scope
                * to the convertHTML function.
                * We should avoid this, since this completly breaks compatibilty for every
                * other project that might want to use this HTML to PDF parser.
                * https://github.com/OpenSlides/OpenSlides/issues/2361
                */
                var text = motion.getTextByMode($scope.viewChangeRecommendations.mode, $scope.version);
                motionContent.push(converter.convertHTML(text, $scope));
                // return converter.convertHTML(text, $scope);
            } else {
                motionContent.push(converter.convertHTML(motion.getText($scope.version), $scope));
                // return converter.convertHTML(motion.getText($scope.version), $scope);
            }
            return motionContent;
        };

        // motion reason heading
        var motionReason = function() {
            var reason = [];
            if (motion.getReason($scope.version)) {
                reason.push({
                    text:  gettextCatalog.getString('Reason') + ":",
                    style: 'LAHHeadding',
                    margin: [0,20,0,0]
                });
                reason.push(converter.convertHTML(motion.getReason($scope.version), $scope));
            }
            return reason;
        };


        // getters
        var getTitle = function() {
            return motion.getTitle($scope.verion);
        };

        var getIdentifier = function() {
            return motion.identifier ? motion.identifier : '';
        };

        var getCategory = function() {
            return motion.category;
        };

        // Generates content as a pdfmake consumable
        var getContent = function() {
            var content = [
                title,
                subtitle,
                metaTable(),
                motionTitle("Gegenstand:", motion.getTitle($scope.version)),
                motionTitle(gettextCatalog.getString('Submitters') + ":", submitters),
                motionText(),
            ];
            if (motionReason()) {
                content.push(motionReason());
            }
            return content;
        };
        return {
            getContent: getContent,
            getTitle: getTitle,
            getIdentifier: getIdentifier,
            getCategory: getCategory
        };
    };

    return {
        createInstance: createInstance
    };
}])

.factory('PollContentProvider', [
    'PDFLayout',
    function(PDFLayout) {
    /**
    * Generates a content provider for polls
    * @constructor
    * @param {string} title - title of poll
    * @param {string} id - if of poll
    * @param {object} gettextCatalog - for translation
    */
    var createInstance = function(title, id, gettextCatalog) {

        /**
        * Returns a single section on the ballot paper
        * @function
        */
        var createSection = function() {
            var sheetend = 75;
            return {
                stack: [{
                    text: gettextCatalog.getString("Motion") + " " + id,
                    style: 'title',
                }, {
                    text: title,
                    style: 'description'
                },
                PDFLayout.createBallotEntry(gettextCatalog.getString("Yes")),
                PDFLayout.createBallotEntry(gettextCatalog.getString("No")),
                PDFLayout.createBallotEntry(gettextCatalog.getString("Abstain")),
                ],
                margin: [0, 0, 0, sheetend]
            };
        };

        /**
        * Returns Content for single motion
        * @function
        * @param {string} id - if of poll
        */

        var getContent = function() {
            return [{
                table: {
                    headerRows: 1,
                    widths: ['*', '*'],
                    body: [
                        [createSection(), createSection()],
                        [createSection(), createSection()],
                        [createSection(), createSection()],
                        [createSection(), createSection()]
                    ],
                },
                layout: PDFLayout.getBallotLayoutLines()
            }];
        };

        return {
            getContent: getContent,
        };
    };
    return {
        createInstance: createInstance
    };
}])

.factory('MotionCatalogContentProvider', [
    'gettextCatalog',
    'PDFLayout',
    'Category',
    'Config',
    function(gettextCatalog, PDFLayout, Category, Config) {

    /**
    * Constructor
    * @function
    * @param {object} allMotions - A sorted array of all motions to parse
    * @param {object} $scope - Current $scope
    */
    var createInstance = function(allMotions, $scope) {

        var title = PDFLayout.createTitle(
                gettextCatalog.getString(Config.get('motions_export_title').value)
        );

        var createPreamble = function() {
            var preambleText = Config.get('motions_export_preamble').value;
            if (preambleText) {
                return {
                    text: preambleText,
                    style: "preamble"
                };
            } else {
                return "";
            }
        };

        var createTOContent = function() {
            var heading = {
                text: gettextCatalog.getString("Table of contents"),
                style: "heading2"
            };

            var toc = [];
            angular.forEach(allMotions, function(motion) {
                var identifier = motion.getIdentifier() ? motion.getIdentifier() : '';
                toc.push(
                    {
                        columns: [
                            {
                                text: identifier,
                                style: 'tableofcontent',
                                width: 30
                            },
                            {
                                text: motion.getTitle(),
                                style: 'tableofcontent'
                            }
                        ]
                    }
                );
            });

            return [
                heading,
                toc,
                PDFLayout.addPageBreak()
            ];
        };

        // function to create the table of catergories (if any)
        var createTOCategories = function() {
            if (Category.getAll().length > 0) {
                var heading = {
                    text: gettextCatalog.getString("Categories"),
                    style: "heading2"
                };

                var toc = [];
                angular.forEach(Category.getAll(), function(cat) {
                    toc.push(
                        {
                            columns: [
                                {
                                    text: cat.prefix,
                                    style: 'tableofcontent',
                                    width: 30
                                },
                                {
                                    text: cat.name,
                                    style: 'tableofcontent'
                                }
                            ]
                        }
                    );
                });

                return [
                    heading,
                    toc,
                    PDFLayout.addPageBreak()
                ];
            } else {
                // if there are no categories, return "empty string"
                // pdfmake takes "null" literally and throws an error
                return "";
            }
        };

        // returns the pure content of the motion, parseable by makepdf
        var getContent = function() {
            var motionContent = [];
            angular.forEach(allMotions, function(motion, key) {
                motionContent.push(motion.getContent());
                if (key < allMotions.length - 1) {
                    motionContent.push(PDFLayout.addPageBreak());
                }
            });

            return [
                title,
                createPreamble(),
                createTOCategories(),
                createTOContent(),
                motionContent
            ];
        };
        return {
            getContent: getContent
        };
    };

    return {
        createInstance: createInstance
    };
}]);

}());
