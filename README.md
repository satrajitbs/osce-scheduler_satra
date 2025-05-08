# OSCE Scheduler Application

A web-based application for generating Objective Structured Clinical Examination (OSCE) schedules with automated time slot allocation and participant management.

## Directory
osce-scheduler/
├── public/
│   ├── index.html
│   └── app.js
├── server.js
├── package.json
├── admin_template.json
├── examinees_sample.xlsx
├── examiners_sample.xlsx
└── clients_sample.xlsx

## Features

- File upload for examinees, examiners, and standardized clients
- Automated schedule generation with configurable time slots
- Visual schedule display
- Data validation and error handling

## Prerequisites

- Node.js (v16 or higher)
- npm (comes with Node.js)
- AngularJS (loaded via CDN in the app)

## Setup Instructions

### 1. Clone the Repository
```bash
git clone [your-repository-url]
cd osce-scheduler

