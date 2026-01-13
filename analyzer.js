import fs from 'fs';

class CodeAnalyzer {
  analyzeCode(code, language = 'javascript') {
    console.log('\n🤖 AI CODE ANALYZER');
    console.log('Analyzing JavaScript Code...\n');

    const issues = [];
    let score = 10;

    // Check for var usage
    if (code.includes('var ')) {
      issues.push({
        severity: 'Medium',
        type: 'Best Practice',
        issue: 'Using "var" instead of "const" or "let"',
        line: this.findLine(code, 'var'),
        fix: 'Replace "var" with "const" for constants or "let" for variables'
      });
      score -= 1;
    }

    // Check for == usage
    if (code.includes('==') && !code.includes('===')) {
      issues.push({
        severity: 'High',
        type: 'Bug Risk',
        issue: 'Using loose equality (==) instead of strict equality (===)',
        line: this.findLine(code, '=='),
        fix: 'Replace "==" with "===" for type-safe comparisons'
      });
      score -= 2;
    }

    // Check for for loops that could be forEach/map
    if (code.match(/for\s*\(/g)) {
      issues.push({
        severity: 'Low',
        type: 'Modernization',
        issue: 'Traditional for-loops found',
        line: this.findLine(code, 'for'),
        fix: 'Consider using Array methods like forEach(), map(), or filter()'
      });
      score -= 0.5;
    }

    // Check for missing error handling
    if (!code.includes('try') && !code.includes('catch')) {
      issues.push({
        severity: 'Medium',
        type: 'Error Handling',
        issue: 'No error handling found',
        line: 'N/A',
        fix: 'Add try-catch blocks for robust error handling'
      });
      score -= 1;
    }

    // Check function naming
    const functionNames = code.match(/function\s+(\w+)/g);
    if (functionNames) {
      functionNames.forEach(fn => {
        const name = fn.replace('function ', '');
        if (name.length < 3) {
          issues.push({
            severity: 'Low',
            type: 'Naming',
            issue: `Function name "${name}" is too short`,
            line: this.findLine(code, fn),
            fix: 'Use descriptive function names (3+ characters)'
          });
          score -= 0.5;
        }
      });
    }

    // Check for magic numbers
    const numbers = code.match(/\d+/g);
    if (numbers && numbers.length > 2) {
      issues.push({
        severity: 'Low',
        type: 'Maintainability',
        issue: 'Magic numbers found in code',
        line: 'Multiple',
        fix: 'Extract numbers into named constants'
      });
      score -= 0.5;
    }

    return {
      score: Math.max(score, 0),
      issues: issues,
      suggestions: this.generateSuggestions(code, issues)
    };
  }

  findLine(code, search) {
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(search)) {
        return i + 1;
      }
    }
    return 'N/A';
  }

  generateSuggestions(code, issues) {
    const suggestions = [];

    if (code.includes('var ')) {
      suggestions.push('Refactor: Use const/let instead of var for better scoping');
    }

    if (code.includes('==')) {
      suggestions.push('Refactor: Use === for type-safe equality checks');
    }

    if (code.match(/for\s*\(/g)) {
      suggestions.push('Modernize: Replace for-loops with Array methods (map, filter, reduce)');
    }

    return suggestions;
  }

  generateRefactoredCode(code) {
    let refactored = code;
    
    // Replace var with const
    refactored = refactored.replace(/var\s+/g, 'const ');
    
    // Replace == with ===
    refactored = refactored.replace(/==/g, '===');
    
    return refactored;
  }

  displayResults(analysis, code) {
    console.log('='.repeat(70));
    console.log('📊 CODE ANALYSIS RESULTS');
    console.log('='.repeat(70));
    
    console.log(`\n⭐ QUALITY SCORE: ${analysis.score}/10`);
    
    const status = analysis.score >= 8 ? '✅ EXCELLENT' : 
                   analysis.score >= 6 ? '⚠️  GOOD' : '❌ NEEDS IMPROVEMENT';
    console.log(`📈 STATUS: ${status}\n`);

    console.log('🚨 ISSUES FOUND:');
    if (analysis.issues.length === 0) {
      console.log('   ✅ No issues found!');
    } else {
      analysis.issues.forEach((issue, i) => {
        console.log(`\n   ${i + 1}. [${issue.severity}] ${issue.type}`);
        console.log(`      Issue: ${issue.issue}`);
        console.log(`      Line: ${issue.line}`);
        console.log(`      Fix: ${issue.fix}`);
      });
    }

    console.log('\n💡 IMPROVEMENT SUGGESTIONS:');
    if (analysis.suggestions.length === 0) {
      console.log('   ✅ Code looks good!');
    } else {
      analysis.suggestions.forEach((suggestion, i) => {
        console.log(`   ${i + 1}. ${suggestion}`);
      });
    }

    console.log('\n🔄 REFACTORED CODE:');
    console.log('─'.repeat(70));
    console.log(this.generateRefactoredCode(code));
    console.log('─'.repeat(70));

    console.log('\n' + '='.repeat(70));
  }

  saveReport(analysis, code) {
    const report = {
      timestamp: new Date().toISOString(),
      qualityScore: analysis.score,
      status: analysis.score >= 8 ? 'EXCELLENT' : 
              analysis.score >= 6 ? 'GOOD' : 'NEEDS IMPROVEMENT',
      issuesFound: analysis.issues.length,
      issues: analysis.issues,
      suggestions: analysis.suggestions,
      originalCode: code,
      refactoredCode: this.generateRefactoredCode(code)
    };

    fs.writeFileSync('report.json', JSON.stringify(report, null, 2));
    console.log('✅ Report saved to report.json\n');
  }
}

// Sample code to analyze
const sampleCode = `
function calculateTotal(items) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total = total + items[i].price;
  }
  return total;
}

function processOrders(orders) {
  var results = [];
  for (var i = 0; i < orders.length; i++) {
    if (orders[i].status == "pending") {
      results.push(orders[i]);
    }
  }
  return results;
}
`;

// Run analysis
const analyzer = new CodeAnalyzer();
const analysis = analyzer.analyzeCode(sampleCode);
analyzer.displayResults(analysis, sampleCode);
analyzer.saveReport(analysis, sampleCode);