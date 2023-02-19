Feature: Program

  Scenario: Create a program
    When I create a program
    Then I should be able to access it

  Scenario: Update a program
    Given a program is created
    When I update the program
    Then I should be able to check the updates

  Scenario: Publish a program
    Given a program is created
    When I publish the program
    Then I should have my release

  Scenario: Update a program with release version
    Given a program is created
    And I publish the program
    When I update the program
    Then I should be able to check the updates
    And the program update did not impact the release

  Scenario: Subscribe on program creation
    Given I subscribed to program added
    When I create a program
    Then I am notified on the created program
