/**
 * DEBUG INTERPOLATE WRAPPER - ENHANCED VERSION
 * 
 * This wrapper detects invalid outputRange values that cause Remotion crashes
 * "outputRange must contain only numbers"
 */

import {interpolate as originalInterpolate} from 'remotion';

export const debugInterpolate = (...args: any[]): any => {
  const [input, inputRange, outputRange] = args;
  
  console.log("🔍 DEBUG interpolate called:");
  console.log("  Input:", input);
  console.log("  Input Range:", inputRange);
  console.log("  Output Range:", outputRange);
  console.log("  Output Range Types:", outputRange?.map((v: any) => typeof v));
  
  // Check if outputRange contains non-numeric values
  if (outputRange && Array.isArray(outputRange)) {
    const invalidValues = outputRange.filter((v: any) => typeof v !== 'number');
    
    if (invalidValues.length > 0) {
      console.error("❌ INVALID interpolate detected:");
      console.error("  Input:", input);
      console.error("  Input Range:", inputRange);
      console.error("  Output Range:", outputRange);
      console.error("  Invalid Values:", invalidValues);
      console.error("  Types:", (outputRange || []).map((v: any) => typeof v));
      console.trace("🔥 STACK TRACE:");
      
      // Still call original to see the actual error
      try {
        return originalInterpolate(...(args as [any, any, any, any]));
      } catch (error: any) {
        console.error("💥 Original interpolate error:", error.message);
        throw error;
      }
    }
  }
  
  const result = originalInterpolate(...(args as [any, any, any, any]));
  console.log("✅ interpolate result:", result);
  return result;
};
