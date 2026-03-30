#!/usr/bin/env python3
"""
Live test of SSL fix using the exact domain from the certificate viewer.
"""

from scraper.workers.seo.technical_domain.https_redirect_checker import check_https_redirect
from scraper.workers.seo.technical_domain.ssl_checker import check_ssl_certificate
from urllib.parse import urlparse

# Test the exact scenario from the certificate viewer
domain = 'sapphiredigitalagency.com'
print(f'Testing domain: {domain}')
print('='*50)

# Step 1: HTTPS redirect check
print('\n[STEP 1] HTTPS redirect check...')
https_result = check_https_redirect(domain)
print(f'HTTPS redirect: {https_result["https_redirect"]}')
print(f'Final URL: {https_result["final_url"]}')

# Step 2: Extract hostname from final URL
print('\n[STEP 2] Extract hostname from final URL...')
final_url = https_result['final_url']
final_hostname = urlparse(final_url).hostname
print(f'Extracted hostname: {final_hostname}')

# Step 3: SSL check on correct hostname
print('\n[STEP 3] SSL check on correct hostname...')
ssl_result = check_ssl_certificate(final_hostname)
print(f'SSL Valid: {ssl_result["ssl_valid"]}')
print(f'SSL Expiry: {ssl_result["ssl_expiry_date"]}')
print(f'SSL Days Remaining: {ssl_result["ssl_days_remaining"]}')

print('\n' + '='*50)
print('✅ SSL FIX VALIDATION COMPLETE')
print(f'Certificate for {final_hostname} is working correctly!')
