#!/usr/bin/env node

import inquirer from 'inquirer';

import fedApi from './fedApi.js';
import prompts from './prompts.js';

(async function run() {
  const { email, password } = await inquirer.prompt(prompts.login);

  const loginRes = await fedApi.login(email, password);

  if (loginRes.code) {
    console.log(`Login failed: ${loginRes.message}`);
    return;
  }

  let searchCourseRes = [];
  while (searchCourseRes.length < 1) {
    const searchCoursePromptRes = await inquirer.prompt(prompts.searchCourse);
    const { query } = searchCoursePromptRes;
    searchCourseRes = await fedApi.search(query);

    if (searchCourseRes.length < 1) {
      console.log('No results found, try again.');
    }
  }

  const list = searchCourseRes.map((course) => {
    const { title, instructors, hasCC, durationSeconds, hash } = course;
    return {
      name: `${title} - ${instructors[0].name} (${parseInt(durationSeconds / 3600)} hours, ${parseInt(durationSeconds / 60 % 60)} minutes) ${hasCC ? '[CC]' : ''}`,
      value: hash,
    };
  });

  const { hash } = await inquirer.prompt(prompts.selectCourse(list));

  const course = await fedApi.course(hash);

  console.log(course);
})();
