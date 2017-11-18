(function () {

"use strict";

angular.module('OpenSlidesApp.motions.pdf', ['OpenSlidesApp.core.pdf'])

.factory('MotionContentProvider', [
    '$q',
    'operator',
    'gettextCatalog',
    'PDFLayout',
    'PdfMakeConverter',
    'ImageConverter',
    'HTMLValidizer',
    'Category',
    'Config',
    'Motion',
    'MotionComment',
    function($q, operator, gettextCatalog, PDFLayout, PdfMakeConverter, ImageConverter, HTMLValidizer,
        Category, Config, Motion, MotionComment) {
        /**
         * Provides the content as JS objects for Motions in pdfMake context
         * @constructor
         */

        var createInstance = function(motion, motionVersion, changeRecommendationMode,
            changeRecommendations, lineNumberMode, includeReason, includeComments) {

            var converter;

            var logoHeaderUrl = Config.get('logo_pdf_header').value.path;

            // Query all image sources from motion text and reason
            var getImageSources = function () {
                var text = motion.getTextByMode(changeRecommendationMode, null);
                var reason = motion.getReason();
                var comments = '';
                if (includeComments) {
                    var fields = MotionComment.getNoSpecialCommentsFields();
                    _.forEach(fields, function (field, id) {
                        if (motion.comments[id]) {
                            comments += HTMLValidizer.validize(motion.comments[id]);
                        }
                    });
                }
                var content = HTMLValidizer.validize(text) + HTMLValidizer.validize(motion.getReason()) + comments;
                var map = Function.prototype.call.bind([].map);
                return map($(content).find('img'), function(element) {
                    return element.getAttribute('src');
                }).concat(logoHeaderUrl);
            };

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
                                text: 'TOP\n' + gettextCatalog.getString('Motion'),
                                style: 'LAHTitle',
                                width: '30%',
                            },
                            {
                                text: number + "\n" + identifier,
                                style: 'LAHTitle',
                            }
                        ],
                        width: '60%'
                    },
                    {
                        //image: logoHeaderUrl,
                        fit: [190, 50],
                    }
                ]
            };
            var setTitleImageData = function (data) {
                title.columns[1].image = data;
            };

            // subtitle
            var line1 = [
                 Config.translate(Config.get('general_event_name').value),
                 Config.translate(Config.get('general_event_description').value)
            ].filter(Boolean).join(' ');
            var line2 = [
                Config.get('general_event_location').value,
                Config.get('general_event_date').value
            ].filter(Boolean).join(', ');
            var text = [line1, line2].join('\n');
           var subtitle = {
                text: text,
                style: 'LAHSubtitle'
            };

            // submitters
            var submitters = _.map(motion.submitters, function (submitter) {
                return submitter.get_full_name();
            }).join(', ');

            // supporters
            var supporters = _.map(motion.supporters, function (supporter) {
                return supporter.get_full_name();
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
                                width: '25%',
                                style: 'bold',
                            },
                            {
                                text: title,
                            },
                        ],
                        margin: [0, 15, 0, 0],
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

            // motion preamble
            var motionPreamble = function () {
                return [
                    {
                        text: 'Beschlussvorschlag:',
                        style: 'bold',
                        marginTop: 25
                    },
                    {
                        text: Config.translate(Config.get('motions_preamble').value),
                        margin: [0, 10, 0, 0]
                    }
                ];
            };

            // motion text (with line-numbers)
            var motionText = function() {
                var motionTextContent = motion.getTextByMode(changeRecommendationMode, motionVersion);
                return converter.convertHTML(motionTextContent, lineNumberMode);
            };

            // motion reason heading
            var motionReason = function() {
                if (includeReason) {
                    var reason = [];
                    if (motion.getReason(motionVersion)) {
                        reason.push({
                            text:  gettextCatalog.getString('Reason') + ':',
                            style: 'bold',
                            marginTop: 25,
                        });
                        reason.push({
                            columns: [
                                {
                                    width: '80%',
                                    stack: converter.convertHTML(motion.getReason(motionVersion), 'none'),
                                },
                            ]
                        });
                    }
                    return reason;
                }
            };

            // motion comments handling
            var motionComments = function () {
                if (includeComments) {
                    var fields = MotionComment.getNoSpecialCommentsFields();
                    var comments = [];
                    _.forEach(fields, function (field, id) {
                        if (motion.comments[id]) {
                            var title = field.name;
                            if (!field.public) {
                                title += ' (' + gettextCatalog.getString('internal') + ')';
                            }
                            comments.push({
                                text: title,
                                style: 'heading3',
                                marginTop: 25,
                            });
                            comments.push(converter.convertHTML(motion.comments[id]));
                        }
                    });
                    return comments;
                }
            };

            // Generates content as a pdfmake consumable
            var getContent = function() {
                var content = [
                    title,
                    subtitle,
                    metaTable(),
                    motionTitle('Gegenstand: ', motion.getTitle(motionVersion)),
                    motionTitle(gettextCatalog.getString('Submitters') + ':', submitters),
                    motionTitle(gettextCatalog.getString('Mitantragsteller/innen') + ':', supporters),
                    motionPreamble(),
                    motionText(),
                ];
                var reason = motionReason();
                if (reason) {
                    content.push(reason);
                }
                var comments = motionComments();
                if (comments) {
                    content.push(comments);
                }
                return content;
            };

            // getters
            var getTitle = function() {
                return motion.getTitle(motionVersion);
            };

            var getIdentifier = function() {
                return motion.identifier ? motion.identifier : '';
            };

            var getCategory = function() {
                return motion.category;
            };

            return $q(function (resolve) {
                ImageConverter.toBase64(getImageSources()).then(function (imageMap) {
                    setTitleImageData(imageMap[logoHeaderUrl].data);
                    converter = PdfMakeConverter.createInstance(imageMap);
                    resolve({
                        getContent: getContent,
                        getTitle: getTitle,
                        getIdentifier: getIdentifier,
                        getCategory: getCategory
                    });
                });
            });
        };

        return {
            createInstance: createInstance
        };
    }
])

.factory('MotionPartialContentProvider', [
    '$q',
    'gettextCatalog',
    'Config',
    'PDFLayout',
    'PdfMakeConverter',
    'ImageConverter',
    'HTMLValidizer',
    function ($q, gettextCatalog, Config, PDFLayout, PdfMakeConverter, ImageConverter, HTMLValidizer) {
        /*
         * content should be an array of content blocks. Each content is an object providing a
         * heading and a text. E.g.
         * [{heading: 'comment1', text: '<html in here>'}, {heading: ...}, ...]
         * */
        var createInstance = function (motion, content) {

            var converter;

            // Query all image sources from the content
            var getImageSources = function () {
                var imageSources = [];
                _.forEach(content, function (contentBlock) {
                    var html = HTMLValidizer.validize(contentBlock.text);
                    imageSources = imageSources.concat(_.map($(html).find('img'), function(element) {
                        return element.getAttribute('src');
                    }));
                });
                return imageSources;
            };

            // title
            var identifier = motion.identifier ? ' ' + motion.identifier : '';
            var title = PDFLayout.createTitle(
                    gettextCatalog.getString('Motion') + identifier + ': ' + motion.getTitle()
            );

            // subtitle and sequential number
            var subtitleLines = [];
            if (motion.parent_id) {
                var parentMotion = Motion.get(motion.parent_id);
                subtitleLines.push(
                    gettextCatalog.getString('Amendment of motion') + ': ' +
                    (parentMotion.identifier ? parentMotion.identifier : parentMotion.getTitle())
                );
            }
            if (Config.get('motions_export_sequential_number').value) {
                subtitleLines.push(gettextCatalog.getString('Sequential number') + ': ' +  motion.id);
            }
            var subtitle = PDFLayout.createSubtitle(subtitleLines);

            // meta data table
            var metaTable = function() {
                var metaTableBody = [];

                // submitters
                var submitters = _.map(motion.submitters, function (submitter) {
                    return submitter.get_full_name();
                }).join(', ');
                metaTableBody.push([
                    {
                        text: gettextCatalog.getString('Submitters') + ':',
                        style: ['bold', 'grey'],
                    },
                    {
                        text: submitters,
                        style: 'grey'
                    }
                ]);

                // state
                metaTableBody.push([
                    {
                        text: gettextCatalog.getString('State') + ':',
                        style: ['bold', 'grey']
                    },
                    {
                        text: motion.getStateName(),
                        style: 'grey'
                    }
                ]);

                // recommendation
                if (motion.getRecommendationName()) {
                    metaTableBody.push([
                        {
                            text: Config.get('motions_recommendations_by').value + ':',
                            style: ['bold', 'grey']
                        },
                        {
                            text: motion.getRecommendationName(),
                            style: 'grey'
                        }
                    ]);
                }

                // category
                if (motion.category) {
                    metaTableBody.push([
                        {
                            text: gettextCatalog.getString('Category') + ':',
                            style: ['bold', 'grey'] },
                        {
                            text: motion.category.prefix + ' - ' + motion.category.name,
                            style: 'grey'
                        }
                    ]);
                }

                // build table
                // Used placeholder for 'layout' functions whiche are
                // replaced by lineWitdh/lineColor function in pfd-worker.js.
                // TODO: Remove placeholder and us static values for LineWidth and LineColor
                // if pdfmake has fixed this.
                var metaTableJsonString = {
                    table: {
                        widths: ['30%','70%'],
                        body: metaTableBody,
                    },
                    margin: [0, 0, 0, 20],
                    layout: '{{motion-placeholder-to-insert-functions-here}}'
                };
                return metaTableJsonString;
            };

            var getContentBlockData = function (block) {
                var data = [];
                data.push({
                    text:  block.heading,
                    style: 'heading3',
                    marginTop: 25,
                });
                data.push(converter.convertHTML(block.text));
                return data;
            };

            // Generates content as a pdfmake consumable
            var getContent = function() {
                var pdfContent = [
                    title,
                    subtitle,
                    metaTable(),
                ];
                _.forEach(content, function (contentBlock) {
                    pdfContent.push(getContentBlockData(contentBlock));
                });
                return pdfContent;
            };

            return $q(function (resolve) {
                ImageConverter.toBase64(getImageSources()).then(function (imageMap) {
                    converter = PdfMakeConverter.createInstance(imageMap);
                    resolve({
                        getContent: getContent,
                    });
                });
            });
        };

        return {
            createInstance: createInstance
        };
    }
])

.factory('PollContentProvider', [
    '$q',
    'PDFLayout',
    'gettextCatalog',
    'Config',
    'User',
    'ImageConverter',
    function($q, PDFLayout, gettextCatalog, Config, User, ImageConverter) {
        /**
        * Generates a content provider for polls
        * @constructor
        * @param {string} title - title of poll
        * @param {string} id - if of poll
        */
        var createInstance = function(title, id) {

            var logoBallotPaperUrl = Config.get('logo_pdf_ballot_paper').value.path;
            var imageMap = {};

            // PDF header
            var header = function() {
                var columns = [];

                var text = Config.get('general_event_name').value;
                columns.push({
                    text: text,
                    fontSize: 8,
                    alignment: 'left',
                    width: '60%'
                });

                // logo
                if (logoBallotPaperUrl) {
                    columns.push({
                        image: imageMap[logoBallotPaperUrl].data,
                        fit: [90,25],
                        alignment: 'right',
                        width: '40%'
                    });
                }
                return {
                    color: '#555',
                    fontSize: 10,
                    margin: [30, 10, 10, -10], // [left, top, right, bottom]
                    columns: columns,
                    columnGap: 5
                };
            };

            /**
            * Returns a single section on the ballot paper
            * @function
            */
            var createSection = function() {
                var sheetend = 40;
                return {
                    stack: [
                        header(),
                        {
                            text: gettextCatalog.getString('Motion') + ' ' + id,
                            style: 'title',
                        },
                        {
                            text: title,
                            style: 'description'
                        },
                        PDFLayout.createBallotEntry(gettextCatalog.getString('Yes')),
                        PDFLayout.createBallotEntry(gettextCatalog.getString('No')),
                        PDFLayout.createBallotEntry(gettextCatalog.getString('Abstain')),
                    ],
                    margin: [0, 0, 0, sheetend],
                };
            };

            /**
            * Returns Content for single motion
            * @function
            * @param {string} id - if of poll
            */
            var getContent = function() {
                var content = [];
                var amount;
                var amount_method = Config.get('motions_pdf_ballot_papers_selection').value;
                switch (amount_method) {
                        case 'NUMBER_OF_ALL_PARTICIPANTS':
                            amount = User.getAll().length;
                            break;
                        case 'NUMBER_OF_DELEGATES':
                            //TODO: assumption that DELEGATES is always group id 2. This may not be true
                            var group_id = 2;
                            amount = User.filter({where: {'groups_id': {contains:group_id} }}).length;
                            break;
                        case 'CUSTOM_NUMBER':
                            amount = Config.get('motions_pdf_ballot_papers_number').value;
                            break;
                        default:
                            // should not happen.
                            amount = 0;
                }
                var fullpages = Math.floor(amount / 8);

                for (var i=0; i < fullpages; i++) {
                    content.push({
                        table: {
                            headerRows: 1,
                            widths: ['*', '*'],
                            body: [
                                [createSection(), createSection()],
                                [createSection(), createSection()],
                                [createSection(), createSection()],
                                [createSection(), createSection()]
                            ],
                            pageBreak: 'after'
                        },
                        layout: PDFLayout.getBallotLayoutLines(),
                        rowsperpage: 4
                    });
                }
                amount = amount  - (fullpages * 8);
                if (amount > 0) {
                    var partialpagebody = [];
                    while (amount > 1) {
                        partialpagebody.push([createSection(), createSection()]);
                        amount -=2;
                    }
                    if (amount == 1) {
                        partialpagebody.push([createSection(), '']);
                    }
                    content.push({
                        table: {
                            headerRows: 1,
                            widths: ['50%', '50%'],
                            body: partialpagebody
                        },
                        layout: PDFLayout.getBallotLayoutLines(),
                        rowsperpage: 4
                    });
                }
                return content;
            };

            return $q(function (resolve) {
                var imageSources = [
                    logoBallotPaperUrl,
                ];
                ImageConverter.toBase64(imageSources).then(function (_imageMap) {
                    imageMap = _imageMap;
                    resolve({
                        getContent: getContent
                    });
                });
            });
        };
        return {
            createInstance: createInstance
        };
    }
])

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
        */
        var createInstance = function(allMotions) {

            var title = PDFLayout.createTitle(
                Config.translate(Config.get('motions_export_title').value)
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
                                    width: 70
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
                var categories = [];
                _.forEach(allMotions, function (motion) {
                    var category = motion.getCategory();
                    if (category) {
                        categories.push(category);
                    }
                });
                var sortKey = Config.get('motions_export_category_sorting').value;
                categories = _.orderBy(_.uniqBy(categories, 'id'), [sortKey]);
                if (categories.length > 1) {
                    var heading = {
                        text: gettextCatalog.getString('Categories'),
                        style: 'heading2',
                    };

                    var toc = [];
                    angular.forEach(categories, function(cat) {
                        toc.push(
                            {
                                columns: [
                                    {
                                        text: cat.prefix,
                                        style: 'tableofcontent',
                                        width: 50
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

            // returns the pure content of the motion, parseable by pdfmake
            var getContent = function() {
                var motionContent = [];
                angular.forEach(allMotions, function(motion, key) {
                    motionContent.push(motion.getContent());
                    if (key < allMotions.length - 1) {
                        motionContent.push(PDFLayout.addPageBreak());
                    }
                });
                var content = [];
                // print extra data (title, preamble, categories, toc) only for more than 1 motion
                if (allMotions.length > 1) {
                    content.push(
                        title,
                        createPreamble(),
                        createTOCategories(),
                        createTOContent()
                    );
                }
                content.push(motionContent);
                return content;
            };
            return {
                getContent: getContent
            };
        };

        return {
            createInstance: createInstance
        };
    }
])

.factory('MotionPdfExport', [
    '$http',
    '$q',
    'operator',
    'Config',
    'gettextCatalog',
    'MotionChangeRecommendation',
    'HTMLValidizer',
    'PdfMakeConverter',
    'MotionContentProvider',
    'MotionCatalogContentProvider',
    'PdfMakeDocumentProvider',
    'PollContentProvider',
    'PdfMakeBallotPaperProvider',
    'MotionPartialContentProvider',
    'PdfCreate',
    'PDFLayout',
    'PersonalNoteManager',
    'MotionComment',
    'Messaging',
    'FileSaver',
    function ($http, $q, operator, Config, gettextCatalog, MotionChangeRecommendation, HTMLValidizer,
        PdfMakeConverter, MotionContentProvider, MotionCatalogContentProvider, PdfMakeDocumentProvider,
        PollContentProvider, PdfMakeBallotPaperProvider, MotionPartialContentProvider, PdfCreate,
        PDFLayout, PersonalNoteManager, MotionComment, Messaging, FileSaver) {
        return {
            getDocumentProvider: function (motions, params, singleMotion) {
                params = _.clone(params || {}); // Clone this to avoid sideeffects.
                _.defaults(params, {
                    filename: gettextCatalog.getString('motions') + '.pdf',
                    changeRecommendationMode: Config.get('motions_recommendation_text_mode').value,
                    lineNumberMode: Config.get('motions_default_line_numbering').value,
                    includeReason: true,
                    includeComments: false,
                });

                if (singleMotion) {
                    _.defaults(params, {
                        version: motions.active_version,
                    });
                    motions = [motions];
                }

                //save the arrays of all motions to an array
                angular.forEach(motions, function (motion) {
                    if (singleMotion) {
                        motion.changeRecommendations = MotionChangeRecommendation.filter({
                            'where': {'motion_version_id': {'==': params.version}}
                        });
                    } else {
                        motion.changeRecommendations = MotionChangeRecommendation.filter({
                            'where': {'motion_version_id': {'==': motion.active_version}}
                        });
                    }
                });

                var motionContentProviderArray = [];
                var motionContentProviderPromises = _.map(motions, function (motion) {
                    var version = (singleMotion ? params.version : motion.active_version);
                    return MotionContentProvider.createInstance(
                        motion, version, params.changeRecommendationMode,
                        motion.changeRecommendations, params.lineNumberMode,
                        params.includeReason, params.includeComments
                    ).then(function (contentProvider) {
                        motionContentProviderArray.push(contentProvider);
                    });
                });

                return $q(function (resolve) {
                    $q.all(motionContentProviderPromises).then(function() {
                        var documentProviderPromise;
                        if (singleMotion) {
                            documentProviderPromise = PdfMakeDocumentProvider.createInstance(motionContentProviderArray[0]);
                        } else {
                            var motionCatalogContentProvider = MotionCatalogContentProvider.createInstance(motionContentProviderArray);
                            documentProviderPromise = PdfMakeDocumentProvider.createInstance(motionCatalogContentProvider);
                        }
                        documentProviderPromise.then(function (documentProvider) {
                            resolve(documentProvider);
                        });
                    });
                });
            },
            export: function (motions, params, singleMotion) {
                params = params || {};
                _.defaults(params, {
                    filename: gettextCatalog.getString('motions') + '.pdf',
                });
                this.getDocumentProvider(motions, params, singleMotion).then(
                    function (documentProvider) {
                        PdfCreate.download(documentProvider.getDocument(), params.filename);
                    }
                );
            },
            exportZip: function (motions, params) {
                var messageId = Messaging.addMessage('<i class="fa fa-spinner fa-pulse fa-lg spacer-right"></i>' +
                    gettextCatalog.getString('Generating PDFs and ZIP archive') + ' ...', 'info');
                var zipFilename = params.filename || gettextCatalog.getString('motions') + '.zip';
                params.filename = void 0; // clear this, so we do not override the default filenames for each pdf.

                var self = this;
                var usedFilenames = [];
                var docMap = {};
                var docPromises = _.map(motions, function (motion) {
                    var identifier = motion.identifier ? '-' + motion.identifier : '';
                    var filename = gettextCatalog.getString('Motion') + identifier;

                    // If the filename is already in use, try to append a number to it (like '(2)')
                    if (_.includes(usedFilenames, filename)) {
                        var i = 1;
                        var filenameWithNumber = filename;
                        while(_.includes(usedFilenames, filenameWithNumber)) {
                            filenameWithNumber = filename + ' (' + i + ')';
                            i++;
                        }
                        filename = filenameWithNumber;
                    }
                    usedFilenames.push(filename);
                    filename += '.pdf';

                    return $q(function (resolve) {
                        // get documentProvider for every motion.
                        self.getDocumentProvider(motion, params, true).then(function (documentProvider) {
                            docMap[filename] = documentProvider.getDocument();
                            resolve();
                        });
                    });
                });
                $q.all(docPromises).then(function () {
                    PdfCreate.getBase64FromMultipleDocuments(docMap).then(function (pdfMap) {
                        var zip = new JSZip();
                        _.forEach(pdfMap, function (data, filename) {
                            zip.file(filename, data, {base64: true});
                        });
                        Messaging.createOrEditMessage(messageId, '<i class="fa fa-check fa-lg spacer-right"></i>' +
                            gettextCatalog.getString('ZIP successfully generated.'), 'success', {timeout: 3000});
                        zip.generateAsync({type: 'blob'}).then(function (content) {
                            FileSaver.saveAs(content, zipFilename);
                        });
                    }, function (error) {
                        Messaging.createOrEditMessage(messageId, '<i class="fa fa-exclamation-triangle fa-lg ' +
                            'spacer-right"></i>' + gettextCatalog.getString('Error while generating ZIP file') +
                            ': <code>' + error + '</code>', 'error');
                    });
                });
            },
            createPollPdf: function (motion, version) {
                var id = motion.identifier.replace(' ', '');
                var title = motion.getTitle(version);
                var filename = gettextCatalog.getString('Motion') + '-' + id + '-' + gettextCatalog.getString('ballot-paper') + '.pdf';
                PollContentProvider.createInstance(title, id).then(function (pollContentProvider) {
                    var documentProvider = PdfMakeBallotPaperProvider.createInstance(pollContentProvider);
                    PdfCreate.download(documentProvider.getDocument(), filename);
                });
            },
            exportPersonalNote: function (motion, filename) {
                var personalNote = PersonalNoteManager.getNote(motion);
                var content = [{
                    heading: gettextCatalog.getString('Personal note'),
                    text: personalNote ? personalNote.note : '',
                }];
                MotionPartialContentProvider.createInstance(motion, content).then(function (contentProvider) {
                    PdfMakeDocumentProvider.createInstance(contentProvider).then(function (documentProvider) {
                        PdfCreate.download(documentProvider.getDocument(), filename);
                    });
                });
            },
            exportComments: function (motion, filename) {
                var fields = MotionComment.getNoSpecialCommentsFields();
                var content = [];
                _.forEach(fields, function (field, id) {
                    if (motion.comments[id]) {
                        var title = field.name;
                        if (!field.public) {
                            title += ' (' + gettextCatalog.getString('internal') + ')';
                        }
                        content.push({
                            heading: title,
                            text: motion.comments[id],
                        });
                    }
                });
                MotionPartialContentProvider.createInstance(motion, content).then(function (contentProvider) {
                    PdfMakeDocumentProvider.createInstance(contentProvider).then(function (documentProvider) {
                        PdfCreate.download(documentProvider.getDocument(), filename);
                    });
                });
            },
        };
    }
]);

}());
