import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATES_DIR = path.join(__dirname, 'templates');

function loadTemplate(templateName) {
  const templatePath = path.join(TEMPLATES_DIR, `${templateName}.hbs`);

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found: ${templateName}`);
  }

  return fs.readFileSync(templatePath, 'utf8');
}

function compileTemplate(templateName, data) {
  const templatePath = path.join(__dirname, 'templates', `${templateName}.hbs`);
  
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found: ${templateName}`);
  }

  const templateSource = fs.readFileSync(templatePath, 'utf8');
  const compiled = handlebars.compile(templateSource);
  
  return compiled(data);
}

handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
  return arg1 === arg2 ? options.fn(this) : options.inverse(this);
});

handlebars.registerHelper('ifGreaterThan', function(arg1, arg2, options) {
  return arg1 > arg2 ? options.fn(this) : options.inverse(this);
});

handlebars.registerHelper('ifLessThan', function(arg1, arg2, options) {
  return arg1 < arg2 ? options.fn(this) : options.inverse(this);
});

// Comparison helpers for use in expressions like {{#if (gte value 70)}}
handlebars.registerHelper('gte', function(a, b) {
  return a >= b;
});

handlebars.registerHelper('gt', function(a, b) {
  return a > b;
});

handlebars.registerHelper('lte', function(a, b) {
  return a <= b;
});

handlebars.registerHelper('lt', function(a, b) {
  return a < b;
});

handlebars.registerHelper('eq', function(a, b) {
  return a === b;
});

// Math helpers
handlebars.registerHelper('div', function(a, b) {
  if (b === 0) return 0;
  return Math.floor(a / b);
});

handlebars.registerHelper('mult', function(a, b) {
  return a * b;
});

handlebars.registerHelper('add', function(a, b) {
  return a + b;
});

handlebars.registerHelper('sub', function(a, b) {
  return a - b;
});

handlebars.registerHelper('round', function(num, precision) {
  if (num === null || num === undefined) return 0;
  const p = precision ? parseInt(precision) : 0;
  return Number(Math.round(num + 'e' + p).toString().replace(/0+$/, '').replace(/\.$/, '')) || 0;
});

handlebars.registerHelper('formatNumber', function(num) {
  if (num === null || num === undefined) return '0';
  return Number(num).toLocaleString();
});

handlebars.registerHelper('formatPercent', function(num, total) {
  if (total === 0) return '0%';
  return `${Math.round((num / total) * 100)}%`;
});

handlebars.registerHelper('formatDate', function(date) {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

handlebars.registerHelper('truncate', function(str, length) {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
});

handlebars.registerHelper('uppercase', function(str) {
  return str ? str.toUpperCase() : '';
});

handlebars.registerHelper('lowercase', function(str) {
  return str ? str.toLowerCase() : '';
});

handlebars.registerHelper('json', function(context) {
  return JSON.stringify(context, null, 2);
});

export function renderSEOTemplate(data) {
  const defaultData = {
    generatedAt: new Date().toISOString(),
    project: {},
    overview: {},
    scores: {},
    issues: {},
    pages: [],
    performance: {}
  };

  const mergedData = { ...defaultData, ...data };

  try {
    const html = compileTemplate('seo-report', mergedData);
    return {
      success: true,
      html
    };
  } catch (error) {
    console.error('[TEMPLATE] SEO template render failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

export function renderAITemplate(data) {
  const defaultData = {
    generatedAt: new Date().toISOString(),
    project: {},
    overview: {},
    scores: {},
    issues: {},
    pages: [],
    entities: {}
  };

  const mergedData = { ...defaultData, ...data };

  try {
    const html = compileTemplate('ai-report', mergedData);
    return {
      success: true,
      html
    };
  } catch (error) {
    console.error('[TEMPLATE] AI template render failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

export function renderCustomTemplate(templateName, data) {
  try {
    const html = compileTemplate(templateName, data);
    return {
      success: true,
      html
    };
  } catch (error) {
    console.error(`[TEMPLATE] Custom template render failed: ${templateName}`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

export function getTemplateList() {
  if (!fs.existsSync(TEMPLATES_DIR)) {
    return [];
  }

  return fs.readdirSync(TEMPLATES_DIR)
    .filter(file => file.endsWith('.hbs'))
    .map(file => file.replace('.hbs', ''));
}

export function validateTemplateData(templateName, data) {
  const errors = [];

  if (templateName === 'seo-report') {
    if (!data.project?.project_name) {
      errors.push('Missing required field: project.project_name');
    }
    if (!data.project?.main_url) {
      errors.push('Missing required field: project.main_url');
    }
  }

  if (templateName === 'ai-report') {
    if (!data.project?.project_name) {
      errors.push('Missing required field: project.project_name');
    }
    if (data.overview?.aiVisibilityScore === undefined) {
      errors.push('Missing required field: overview.aiVisibilityScore');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export default {
  renderSEOTemplate,
  renderAITemplate,
  renderCustomTemplate,
  getTemplateList,
  validateTemplateData
};
