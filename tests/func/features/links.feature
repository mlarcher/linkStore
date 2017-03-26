@links
Feature: links API
    As a user of LinkStore
    I want to be able to handle links

    ####################################################################################################################
    #                                                 ERROR CASES                                                      #
    ####################################################################################################################

    Scenario: Trying to add a link with wrong url format
        Given {"query":"\n\nmutation {\n  addLink(url: \"test\"){\n    id\n    url\n  }\n}","variables":null} as JSON body
        When I POST /graphql
        Then I should receive a 200 HTTP status code
        Then I should receive a JSON body containing Invalid parameter at path errors[0].message

    ####################################################################################################################
    #                                                 SUCCESS CASES                                                     #
    ####################################################################################################################

    Scenario: Getting the links list
        Given {"query":"\nquery {\n  links {\n    id\n    url\n    title\n    votes\n  }\n}","variables":null} as JSON body
        When I POST /graphql
        Then I should receive a 200 HTTP status code
        And  The body response data.links path should have an array with 10 items

    Scenario: Adding a link
        Given {"query":"mutation {\n  addLink(url: \"http://mocks:8080/page1\"){\n    id\n    url\n    title\n    votes\n  }\n}","variables":null} as JSON body
        When I POST /graphql
        Then I should receive a 200 HTTP status code
        Then I should receive a JSON body containing http://mocks:8080/page1 at path data.addLink.url
        Then I should receive a JSON body containing page 1 title at path data.addLink.title
        Then I should receive a JSON body containing 0((number)) at path data.addLink.votes
        Given {"query":"\nquery {\n  links {\n    id\n    url\n    title\n    votes\n  }\n}","variables":null} as JSON body
        When I POST /graphql
        Then I should receive a 200 HTTP status code
        And  The body response data.links path should have an array with 11 items
        Then I should receive a JSON body containing 0((number)) at path data.links[10].votes

    Scenario: UpVoting a link
        Given {"query":"mutation {\n  upVoteLink(url: \"http://mocks:8080/page1\"){\n    id\n    url\n    title\n    votes\n  }\n}","variables":null} as JSON body
        When I POST /graphql
        Then I should receive a 200 HTTP status code
        Then I should receive a JSON body containing http://mocks:8080/page1 at path data.upVoteLink.url
        Then I should receive a JSON body containing 1((number)) at path data.upVoteLink.votes
        Given I wait for 200 ms
        Given {"query":"\nquery {\n  links {\n    id\n    url\n    title\n    votes\n  }\n}","variables":null} as JSON body
        When I POST /graphql
        Then I should receive a 200 HTTP status code
        And  The body response data.links path should have an array with 11 items
        Then I should receive a JSON body containing 1((number)) at path data.links[10].votes

    Scenario: Testing sort order
        Given {"query":"mutation {\n  addLink(url: \"http://mocks:8080/page2\"){\n    id\n    url\n    title\n    votes\n  }\n}","variables":null} as JSON body
        When I POST /graphql
        Given {"query":"mutation {\n  upVoteLink(url: \"http://mocks:8080/page2\"){\n    id\n    url\n    title\n    votes\n  }\n}","variables":null} as JSON body
        When I POST /graphql
        Given {"query":"mutation {\n  upVoteLink(url: \"http://mocks:8080/page2\"){\n    id\n    url\n    title\n    votes\n  }\n}","variables":null} as JSON body
        When I POST /graphql
        Given I wait for 200 ms
        Given {"query":"\nquery {\n  links {\n    id\n    url\n    title\n    votes\n  }\n}","variables":null} as JSON body
        When I POST /graphql
        Then I should receive a 200 HTTP status code
        And  The body response data.links path should have an array with 12 items
        Then I should receive a JSON body containing 2((number)) at path data.links[10].votes
        Then I should receive a JSON body containing http://mocks:8080/page2 at path data.links[10].url
        Then I should receive a JSON body containing 1((number)) at path data.links[11].votes
        Then I should receive a JSON body containing http://mocks:8080/page1 at path data.links[11].url
