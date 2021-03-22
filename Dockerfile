FROM public.ecr.aws/lambda/nodejs:12
# Define function directory
ARG FUNCTION_DIR="./"
ADD *.js README.md package*.json ${FUNCTION_DIR}
ADD config ${FUNCTION_DIR}/config
RUN npm install
CMD ["server.handler"]
#ENTRYPOINT ["/var/task"]