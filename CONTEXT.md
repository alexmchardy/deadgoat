# Weed Tracking Domain

## Core Entities

### Report
A user-submitted observation of a weed infestation.

- **Event Type**:
    - `find`: The infestation was reported as discovered.
    - `remove`: The infestation was reported as removed.
- **Status**:
    - `reported`: The initial submission state.
    - `verified`: The submission has been confirmed by an administrator.
- **Data**:
    - **Coordinates**: Required. Used for geographic placement and linking.
    - **Date of Observation**: Required. The date the user saw the weeds.
    - **Submission Timestamp**: Required. The time the record was created.
    - **Photo**: Optional. A visual record of the infestation.
    - **Description**: Optional. Additional context provided by the user.

### Infestation
A physical occurrence of weeds in the real world, represented by the aggregate of its reports.

- **Lifecycle**:
    - An **Infestation** is automatically created when the first **Report** at a new location is submitted.
- **Linking**:
    - Any new **Report** submitted within a rough 1-meter approximation of an existing **Infestation**'s coordinates is linked to that **Infestation**.
- **State**:
    - The **Infestation** does not have independent state fields. Its state is derived from the latest linked **Report** based on the `Submission Timestamp`.
    - **Infestation Type**: Inherited from the latest **Report**'s `Event Type` (`find` or `remove`).
    - **Infestation Status**: Inherited from the latest **Report**'s `Status` (`reported` or `verified`).

## Business Rules

- **Duplicate Handling**: If a report is submitted at a location already occupied by an **Infestation**, it is linked to that **Infestation** rather than creating a new one.
- **Proximity**: The 1-meter proximity check is a rough approximation suitable for the initial phase.
- **Admin Actions**: When an administrator verifies an infestation or marks it as removed, a new **Report** is created with the corresponding `Event Type` and `Status` (`verified`).
