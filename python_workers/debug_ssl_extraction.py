#!/usr/bin/env python3
"""
Debug script to examine SSL certificate data extraction.
"""

import ssl
import socket
import datetime
from urllib.parse import urlparse

def debug_ssl_certificate(hostname: str):
    """Debug SSL certificate extraction to see what data we're getting."""
    print(f"Debugging SSL certificate for: {hostname}")
    print("="*60)
    
    try:
        # Create SSL context
        context = ssl.create_default_context()
        context.check_hostname = False
        context.verify_mode = ssl.CERT_NONE
        
        # Open TLS socket connection
        with socket.create_connection((hostname, 443), timeout=10) as sock:
            with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                print("✅ TLS connection established")
                
                # Get certificate info in different formats
                print("\n[DEBUG] Certificate Information:")
                
                # Method 1: getpeercert() - dictionary format
                cert_info = ssock.getpeercert()
                print(f"cert_info type: {type(cert_info)}")
                print(f"cert_info: {cert_info}")
                
                if cert_info and isinstance(cert_info, dict):
                    print(f"\nCertificate keys: {list(cert_info.keys())}")
                    if 'notAfter' in cert_info:
                        print(f"notAfter raw: {cert_info['notAfter']}")
                        print(f"notAfter type: {type(cert_info['notAfter'])}")
                        
                        # Try to parse the date
                        expiry_date_str = cert_info['notAfter']
                        try:
                            expiry_date = datetime.datetime.strptime(expiry_date_str, '%b %d %H:%M:%S %Y %Z')
                            print(f"✅ Parsed expiry date: {expiry_date}")
                            
                            # Calculate days remaining
                            now = datetime.datetime.now()
                            days_remaining = (expiry_date - now).days
                            print(f"Days remaining: {days_remaining}")
                            
                        except ValueError as e:
                            print(f"❌ Date parsing failed: {e}")
                            
                            # Try alternative date formats
                            formats_to_try = [
                                '%b %d %H:%M:%S %Y %Z',
                                '%Y-%m-%d %H:%M:%S',
                                '%Y%m%d%H%M%SZ',
                                '%Y-%m-%dT%H:%M:%SZ'
                            ]
                            
                            for fmt in formats_to_try:
                                try:
                                    expiry_date = datetime.datetime.strptime(expiry_date_str, fmt)
                                    print(f"✅ Alternative format worked ({fmt}): {expiry_date}")
                                    break
                                except ValueError:
                                    continue
                    else:
                        print("❌ 'notAfter' key not found in certificate")
                else:
                    print("❌ cert_info is not a valid dictionary")
                
                # Method 2: getpeercert(binary_form=True) - DER format
                print(f"\n[DEBUG] Binary certificate:")
                try:
                    der_cert = ssock.getpeercert(binary_form=True)
                    print(f"DER certificate length: {len(der_cert)} bytes")
                    print(f"DER certificate type: {type(der_cert)}")
                except Exception as e:
                    print(f"❌ Failed to get DER certificate: {e}")
                
                # Method 3: Try to get certificate in PEM format
                print(f"\n[DEBUG] PEM certificate:")
                try:
                    # This might work on some systems
                    cert_der = ssock.getpeercert(binary_form=True)
                    import base64
                    cert_pem = ssl.DER_cert_to_PEM_cert(cert_der)
                    print(f"PEM certificate (first 200 chars): {cert_pem[:200]}...")
                except Exception as e:
                    print(f"❌ Failed to get PEM certificate: {e}")
                
    except Exception as e:
        print(f"❌ SSL connection failed: {e}")

if __name__ == "__main__":
    # Test with the domain from the certificate viewer
    debug_ssl_certificate("www.sapphiredigitalagency.com")
