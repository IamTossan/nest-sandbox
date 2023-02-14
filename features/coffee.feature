Feature: Coffee

  Scenario: List coffees
    When I GET "/coffees"
    Then the server should return a list of coffees

  Scenario: Get a coffee by id
    Given a coffee is created
    When I GET "/coffees" with my id
    Then the server should return my coffee

  Scenario: Error getting a coffee by id
    When I GET "/coffees" #9999
    Then the server should return an error

  Scenario: Create a coffee
    When I POST "/coffees"
    Then the server should create a coffee

  Scenario: Update a coffee
    Given a coffee is created
    When I PATCH "/coffees" with my id
    Then the server should update a coffee

  Scenario: Delete a coffee
    Given a coffee is created
    When I DELETE "/coffees" with my id
    Then the server should delete a coffee
