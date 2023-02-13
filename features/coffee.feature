Feature: Coffee

  Scenario: Query string
    Given the server is running
    When I GET "/coffees/3"
    Then the server should send back "coffee #3 item"
