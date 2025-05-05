describe("Food Tracking", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("should add a new food log", () => {
    // Fill out the food form
    cy.get("#food-type").type("Kibble");
    cy.get("#food-quantity").type("1 cup");
    cy.get("#food-location").type("Kitchen");

    // Submit the form
    cy.get("#food-form").submit();

    // Verify the new log appears in the food logs section
    cy.get("#food-logs").should("contain", "Kibble");
    cy.get("#food-logs").should("contain", "1 cup");
    cy.get("#food-logs").should("contain", "Kitchen");
  });

  it("should mark food as stolen", () => {
    // Fill out the food form
    cy.get("#food-type").type("Treat");
    cy.get("#food-quantity").type("1 piece");
    cy.get("#food-stolen").check();

    // Submit the form
    cy.get("#food-form").submit();

    // Verify the stolen badge appears
    cy.get("#food-logs").should("contain", "Stolen!");
  });

  it("should use current location", () => {
    // Mock geolocation
    cy.window().then((win) => {
      cy.stub(win.navigator.geolocation, "getCurrentPosition").callsFake(
        (callback) => {
          callback({ coords: { latitude: 37.7749, longitude: -122.4194 } });
        },
      );
    });

    // Click the location button
    cy.get("#food-use-location").click();

    // Verify the location is filled
    cy.get("#food-location").should("have.value", "37.77490, -122.41940");
  });
});
