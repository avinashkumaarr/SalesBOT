#!/usr/bin/env node

// Workaround for Node 24 TypeScript stripping issues
process.env.NODE_NO_EXPERIMENTAL_STRIP_TYPES = '1';

// Run expo start
require('expo/cli').main(['start']);
