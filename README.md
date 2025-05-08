# OSCE Scheduler Application

A web-based application for generating Objective Structured Clinical Examination (OSCE) schedules with automated time slot allocation and participant management.

## Directory Structure
- **`public/`** - Frontend files
  - `index.html` - Main application page
  - `app.js` - AngularJS controller
- **Root files** - Backend and configuration
  - `server.js` - Node.js/Express server
  - `package.json` - Node.js dependencies
  - `admin_template.json` - Exam track configuration
- **Sample data files** (Excel format)
  - `examinees_sample.xlsx` - Examinee participants
  - `examiners_sample.xlsx` - Examiner participants
  - `clients_sample.xlsx` - Standardized clients

## Features
File upload for examinees, examiners, and standardized clients
Automated schedule generation with configurable time slots
Visual schedule display
Data validation and error handling

## Prerequisites
Node.js (v16 or higher)
npm (comes with Node.js)
AngularJS (loaded via CDN in the app)

## Setup Instructions
### Clone the Repository
```bash
git clone git@github.com:satrajitbs/osce-scheduler_satra.git
cd osce-scheduler_satra
```
### Run
``` bash
npm install
npm start
```
