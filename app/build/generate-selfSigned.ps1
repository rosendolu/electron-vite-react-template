# $params = @{
#     DnsName = 'localhost', 'localhost'
#     CertStoreLocation = 'Cert:\LocalMachine\My'
# }
# New-SelfSignedCertificate @params



$cert = New-SelfSignedCertificate -DnsName "localhost" -CertStoreLocation 'Cert:\LocalMachine\My'

$password = ConvertTo-SecureString -String "zhoubindaydayup" -Force -AsPlainText
Export-PfxCertificate -Cert $cert -FilePath "C:\Users\rosen\cert\certificate.pfx" -Password $password