#!/usr/bin/env python3
"""
Test robust SSL certificate parsing using cryptography library.
"""

import ssl
import socket
import datetime
from urllib.parse import urlparse

def test_ssl_with_cryptography(hostname: str):
    """Test SSL certificate parsing using cryptography library."""
    print(f"Testing SSL certificate parsing for: {hostname}")
    print("="*60)
    
    try:
        # Try to import cryptography
        try:
            from cryptography import x509
            from cryptography.hazmat.backends import default_backend
            print("✅ Cryptography library available")
        except ImportError:
            print("❌ Cryptography library not available, using fallback method")
            return False
        
        # Create SSL context
        context = ssl.create_default_context()
        context.check_hostname = False
        context.verify_mode = ssl.CERT_NONE
        
        # Open TLS socket connection
        with socket.create_connection((hostname, 443), timeout=10) as sock:
            with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                print("✅ TLS connection established")
                
                # Get DER certificate
                der_cert = ssock.getpeercert(binary_form=True)
                print(f"✅ Got DER certificate ({len(der_cert)} bytes)")
                
                # Parse with cryptography
                cert = x509.load_der_x509_certificate(der_cert, default_backend())
                print(f"✅ Certificate parsed with cryptography")
                
                # Extract expiry date
                not_after = cert.not_valid_after
                print(f"✅ Certificate expiry date: {not_after}")
                
                # Calculate days remaining
                now = datetime.datetime.now()
                days_remaining = (not_after - now).days
                print(f"✅ Days remaining: {days_remaining}")
                
                # Get subject Common Name
                subject = cert.subject
                cn = None
                for attr in subject:
                    if attr.oid == x509.NameOID.COMMON_NAME:
                        cn = attr.value
                        break
                
                print(f"✅ Certificate CN: {cn}")
                
                # Get issuer
                issuer = cert.issuer
                issuer_cn = None
                for attr in issuer:
                    if attr.oid == x509.NameOID.COMMON_NAME:
                        issuer_cn = attr.value
                        break
                
                print(f"✅ Issuer CN: {issuer_cn}")
                
                return True
                
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_ssl_with_cryptography("www.sapphiredigitalagency.com")
