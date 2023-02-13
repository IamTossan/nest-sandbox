Feature: Server

  Scenario: Say hello
    Given the server is running
    When I GET "/"
    Then the server should send back "Hello World!"
