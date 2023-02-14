Feature: Server

  Scenario: Say hello
    When I GET "/"
    Then the server should return "Hello World!"
